namespace Gv24.ApiContracts.v1_0
{
    public class RouteStep : RouteStepIdentity
    {
        /// <summary>
        /// Адрес отправления.
        /// </summary>
        public AddressIdentity DepartureAddress;

        /// <summary>
        /// Адрес прибытия.
        /// </summary>
        public AddressIdentity ArrivalAddress;
        
        /// <summary>
        /// Дистанция в километрах.
        /// </summary>
        public decimal DistanceKm;
        
        /// <summary>
        /// Погрузки в адресе отправления.
        /// </summary>
        public CargoTransportationIdentity[] LoadingsAtDeparture;
        
        /// <summary>
        /// Выгрузки в адресе прибытия.
        /// </summary>
        public CargoTransportationIdentity[] UnloadingsAtArrival;

        /// <summary>
        /// Состояние исполнения шага маршрута.
        /// </summary>
        public RouteStepStatus Status;
    }
}