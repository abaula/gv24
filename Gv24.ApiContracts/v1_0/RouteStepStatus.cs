using System;

namespace Gv24.ApiContracts.v1_0
{
    public class RouteStepStatus : RouteStepStatusIdentity
    {
        public string Name;
        public DateTime StatusDateTimeUtc;
    }
}