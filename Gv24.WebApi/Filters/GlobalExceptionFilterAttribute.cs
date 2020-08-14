using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Logging;
using System;
using System.Net;

namespace Gv24.WebApi.Filters
{
    /// <inheritdoc />
    public class GlobalExceptionFilterAttribute : ExceptionFilterAttribute
    {
        private readonly ILogger<GlobalExceptionFilterAttribute> _logger;

        /// <inheritdoc />
        public GlobalExceptionFilterAttribute(ILogger<GlobalExceptionFilterAttribute> logger)
        {
            _logger = logger;
        }

        /// <inheritdoc />
        public override void OnException(ExceptionContext context)
        {
            _logger.LogError(context.Exception.ToString());

            if(context.Exception.GetType() == typeof(UnauthorizedAccessException))
            {
                context.Result = new JsonResult(context.Exception.Message)
                {
                    StatusCode = (int)HttpStatusCode.Forbidden
                };

                return;
            }

            context.Result = new StatusCodeResult((int)HttpStatusCode.InternalServerError);
        }
    }
}
