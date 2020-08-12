
namespace Gv24.ApiContracts.v1_0
{
    /// <summary>
    /// Адрес.
    /// </summary>
    public class Address : AddressIdentity
    {
        public City City { get; set; }
        public string PostCode { get; set; }
        public string FullAddress { get; set; }
        public string AddressNote { get; set; }
    }
}