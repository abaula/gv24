namespace Gv24.ApiContracts.v1_0
{
    /// <summary>
    /// Шаг маршрута грузоперевозки.
    /// </summary>
    public class RouteStep : RouteStepIdentity
    {
        /// <summary>
        /// Адрес отправления.
        /// </summary>
        public AddressIdentity DepartureAddress { get; set; }

        /// <summary>
        /// Адрес прибытия.
        /// </summary>
        public AddressIdentity ArrivalAddress { get; set; }
        
        /// <summary>
        /// Дистанция в километрах.
        /// </summary>
        public decimal DistanceKm { get; set; }
        
        /// <summary>
        /// Погрузки в адресе отправления.
        /// </summary>
        public CargoTransportationIdentity[] LoadingsAtDeparture { get; set; }
        
        /// <summary>
        /// Выгрузки в адресе прибытия.
        /// </summary>
        public CargoTransportationIdentity[] UnloadingsAtArrival { get; set; }

        /// <summary>
        /// Состояние исполнения шага маршрута.
        /// </summary>
        public RouteStepStatus Status { get; set; }
    }
}