using System;
using System.Threading.Tasks;
using Gv24.ApiContracts.v1_0;
using Gv24.WebApi.Const;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Gv24.WebApi.Controllers.v1_0
{
    [ApiController]
    [ApiVersion(ApiVersionConst.V1_0)]
    [Route("v{version:apiVersion}/[controller]")]
    public class AddressController : ControllerBase
    {
        private readonly ILogger<AddressController> _logger;

        public AddressController(ILogger<AddressController> logger)
        {
            _logger = logger;
        }

        [HttpGet]
        [Route("{id}")]
        public Task<Address> Get([FromRoute] Guid id)
        {
            _logger.LogTrace(nameof(AddressController.Delete));
            
            return Task.FromResult(new Address{
                Id = id,
                City = new City(),
                PostCode = "123",
                FullAddress = "улица Широкая, дом 1",
                AddressNote = "крайний дом слева"
            });
        } 

        [HttpGet]
        [Route("find")]
        public Task<DataFrame<Address>> Find([FromQuery] SearchRequest request)
        {
            _logger.LogTrace(nameof(AddressController.Find));
            
            return Task.FromResult(new DataFrame<Address>{ 
                Items = Array.Empty<Address>(),
                HasNext = false
            });
        }

        [HttpPost]
        [Route("add")]
        public Task<CreatedAtActionResult> Add([FromBody] Address address)
        {
            _logger.LogTrace(nameof(AddressController.Add));
            
            return Task.FromResult(CreatedAtAction(nameof(Get), 
                new { 
                        id = address.Id, 
                        version = ApiVersionConst.V1_0 
                    }, 
                null)
            );
        }

        [HttpDelete]
        [Route("delete/{id}")]
        public Task<NoContentResult> Delete([FromRoute] Guid id)
        {
            _logger.LogTrace(nameof(AddressController.Delete));
            
            return Task.FromResult(NoContent());
        }        
    }
}