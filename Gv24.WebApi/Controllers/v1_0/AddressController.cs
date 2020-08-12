using System;
using System.Threading.Tasks;
using Gv24.ApiContracts.v1_0;
using Gv24.WebApi.Const;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Gv24.WebApi.Controllers.v1_0
{
    [ApiController]
    [ApiVersion(ApiVersionConst.V1)]
    [Route("v{version:apiVersion}/[controller]")]
    public class AddressController : ControllerBase
    {
        private readonly ILogger<AddressController> _logger;

        public AddressController(ILogger<AddressController> logger)
        {
            _logger = logger;
        }


        [HttpPost]
        [Route("find")]
        public Task<DataFrame<Address>> Find([FromBody] SearchRequest request)
        {
            return Task.FromResult(new DataFrame<Address>{ 
                Items = Array.Empty<Address>(),
                HasNext = false
            });
        }
    }
}