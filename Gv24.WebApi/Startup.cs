using Gv24.WebApi.Const;
using Gv24.WebApi.Filters;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;

namespace Gv24.WebApi
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddApiVersioning();
            services.AddControllers();
            services.AddSwaggerGen();

            services.AddSwaggerGen(
                c =>
                {
                    c.SwaggerDoc(
                        $"v{ApiVersionConst.V1}",
                        new OpenApiInfo
                        {
                            Title = "Gv24 API",
                            Version = $"v{ApiVersionConst.V1}"
                        });
                    c.OperationFilter<RemoveVersionParameterFilter>();
                    c.DocumentFilter<ReplaceVersionWithExactValueInPathFilter>();
                    c.EnableAnnotations();
                });
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
                c.SwaggerEndpoint($"/swagger/v{ApiVersionConst.V1}/swagger.json", $"Gv24 API v{ApiVersionConst.V1}");
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
    }
}
