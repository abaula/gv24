using System;
using System.Collections.Generic;
using System.IO;
using System.Runtime.InteropServices;
using Autofac;
using Gv24.WebApi.Const;
using Gv24.WebApi.Filters;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using NLog;
using NLog.Web;

namespace Gv24.WebApi
{
    public class Startup
    {
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly IConfigurationRoot _configuration;
        private NLog.Logger _logger;

        public Startup(IWebHostEnvironment env)
        {
            _hostingEnvironment = env;
            var aspNetCoreEnvironment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "dev";
            var platform = GetSupportedOsPlatformName();
            ConfigureNLog(platform, aspNetCoreEnvironment);

            var configurationBuilder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddEnvironmentVariables();

            AddAppSettings(configurationBuilder, platform, aspNetCoreEnvironment);
            _configuration = configurationBuilder.Build();

            _logger.Info("Application started.");
            _logger.Info($"Startup info: ASPNETCORE_ENVIRONMENT: {aspNetCoreEnvironment}.");            
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            try
            {
                services.AddSingleton<IConfiguration>(_configuration);
                services.AddMemoryCache();
                services.AddControllers(opt => 
                    opt.Filters.Add(typeof(GlobalExceptionFilterAttribute))
                    );                            
                services.AddApiVersioning();
                services.AddOptions();

                services.AddSwaggerGen(
                    c =>
                    {
                        c.SwaggerDoc(
                            $"v{ApiVersionConst.V1_0}",
                            new OpenApiInfo
                            {
                                Title = "Gv24 API",
                                Version = $"v{ApiVersionConst.V1_0}"
                            });
                        c.OperationFilter<RemoveVersionParameterFilter>();
                        c.DocumentFilter<ReplaceVersionWithExactValueInPathFilter>();
                        c.DocumentFilter<CamelCaseDocumentFilter>();
                        c.EnableAnnotations();
                    });                
            }
            catch(Exception ex)
            {
                _logger.Error(ex.ToString());
                throw;
            }
        }

        public void ConfigureContainer(ContainerBuilder builder)
        {
            try
            {
                ModuleBootstrapper.Configure(_configuration, builder);
            }
            catch(Exception ex)
            {
                _logger.Error(ex.ToString());
                throw;
            }            
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            // Enable middleware to serve generated Swagger as a JSON endpoint.
            app.UseSwagger();

            // Enable middleware to serve swagger-ui (HTML, JS, CSS, etc.),
            // specifying the Swagger JSON endpoint.
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint($"/swagger/v{ApiVersionConst.V1_0}/swagger.json", $"Gv24 API v{ApiVersionConst.V1_0}");
            });
            
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseHttpsRedirection();

            app.UseRouting();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }

        private string GetSupportedOsPlatformName()
        {
            if(RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                return "win";

            if(RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
                return "linux";  

            throw new PlatformNotSupportedException();              
        }

        private void AddAppSettings(IConfigurationBuilder builder, string platform, string aspNetCoreEnvironment)
        {
            var settingsFound = false;
            var configFile = "appsettings.json";

            if(File.Exists(configFile))
            {
                settingsFound = true;
                LogAppSettingsConfigurationFileName(configFile);
                builder.AddJsonFile(configFile, optional: false, reloadOnChange: true);
            }

            configFile = $"appsettings.{aspNetCoreEnvironment}.json";

            if(File.Exists(configFile))
            {
                settingsFound = true;
                LogAppSettingsConfigurationFileName(configFile);
                builder.AddJsonFile(configFile, optional: false, reloadOnChange: true);
            }

            configFile = $"appsettings.{platform}.{aspNetCoreEnvironment}.json";

            if(File.Exists(configFile))
            {
                settingsFound = true;
                LogAppSettingsConfigurationFileName(configFile);
                builder.AddJsonFile(configFile, optional: false, reloadOnChange: true);
            }            

            if(settingsFound == false)
            {
                var error = "No appsettings files found.";
                _logger.Error(error);
                throw new FileNotFoundException(error);
            }
        }

        private void LogAppSettingsConfigurationFileName(string fileName)
        {
            _logger.Info($"Loaded AppSettings configuration: {fileName}.");
        }

        private void ConfigureNLog(string platform, string aspNetCoreEnvironment)
        {
            (var logFactory, var configFile) = CreateNLogFactory(platform, aspNetCoreEnvironment);
            _logger = logFactory.GetCurrentClassLogger();
            LogNLogConfigurationFileName(configFile);
        }

        private (LogFactory logFactory, string configFile) CreateNLogFactory(string platform, string aspNetCoreEnvironment)
        {            
            var configFile = $"nlog.{platform}.{aspNetCoreEnvironment}.config";

            if(File.Exists(configFile))
                return (NLogBuilder.ConfigureNLog(configFile), configFile);

            configFile = $"nlog.{aspNetCoreEnvironment}.config";

            if(File.Exists(configFile))
                return (NLogBuilder.ConfigureNLog(configFile), configFile);

            configFile = "nlog.config";

            if(File.Exists(configFile))
                return (NLogBuilder.ConfigureNLog(configFile), configFile);

            throw new FileNotFoundException("NLog configuration file not found.");
        }

        private void LogNLogConfigurationFileName(string fileName)
        {
            _logger.Info($"Loaded NLog configuration: {fileName}.");
        }
    }
}
