using System;

namespace Gv24.ApiContracts.v1_0
{
    /// <summary>
    /// Статус шага маршрута грузоперевозки.
    /// </summary>
    public class RouteStepStatus : RouteStepStatusIdentity
    {
        public string Name { get; set; }
        public DateTime StatusDateTimeUtc { get; set; }
    }
}