using System;

namespace Gv24.ApiContracts.v1_0
{
    public class CargoTransportationStatus : CargoTransportationStatusIdentity
    {
        public string Name;
        public DateTime StatusDateTimeUtc;
    }
}