
using System;

namespace Gv24.ApiContracts.v1_0
{
    /// <summary>
    /// Маршрут грузоперевозки.
    /// </summary>
    public class Route : RouteIdentity
    {
        /// <summary>
        /// Последовательность шагов маршрута.
        /// </summary>
        public RouteStep[] Steps { get; set; }
        
        /// <summary>
        /// Дистанция маршрута в километрах.
        /// </summary>
        public decimal DistanceKm { get; set; }

        /// <summary>
        /// Расчётная продолжительность.
        /// </summary>
        public DateTimeOffset EstimatedDuration { get; set; }

        /// <summary>
        /// Лог маршрута.
        /// </summary>
        public RouteLogEntry[] Log { get; set; }
    }
}
