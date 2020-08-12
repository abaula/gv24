namespace Gv24.ApiContracts.v1_0
{
    /// <summary>
    /// Путевой лист - содержит полуню информацию о маршруте грузоперевозки.
    /// </summary>
    public class ShippingManifest : ShippingManifestIdentity
    {
        public Vehicle Vehicle { get; set; }
        public CargoTransportation[] CargoTransportations { get; set; }
        public Route Route { get; set; }
    }
}