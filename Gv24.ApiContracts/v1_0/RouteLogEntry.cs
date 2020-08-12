using System;

namespace Gv24.ApiContracts.v1_0
{
    /// <summary>
    /// Запись лога для маршрута грузоперевозки.
    /// </summary>
    public class RouteLogEntry : RouteLogEntryIdentity
    {
        public string Message { get; set; }
        public DateTime StatusDateTimeUtc { get; set; }
    }
}