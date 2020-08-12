using System;

namespace Gv24.ApiContracts.v1_0
{
    /// <summary>
    /// Статус контракта на грузоперевозку.
    /// </summary>
    public class CargoTransportationStatus : CargoTransportationStatusIdentity
    {
        public string Name { get; set; }
        public DateTime StatusDateTimeUtc { get; set; }
    }
}