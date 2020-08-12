
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
        public RouteStep[] Steps;
        
        /// <summary>
        /// Дистанция маршрута в километрах.
        /// </summary>
        public decimal DistanceKm;

        /// <summary>
        /// Расчётная продолжительность.
        /// </summary>
        public DateTimeOffset EstimatedDuration;

        /// <summary>
        /// Лог маршрута.
        /// </summary>
        public RouteLogEntry[] Log;
    }
}
