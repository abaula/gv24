
namespace Gv24.ApiContracts.v1_0
{
    /// <summary>
    /// Контракт на грузоперевозку.
    /// </summary>
    public class CargoTransportation : CargoTransportationIdentity
    {
        /// <summary>
        /// Адрес отправления.
        /// </summary>
        public Address DepartureAddress { get; set; }

        /// <summary>
        /// Адрес прибытия.
        /// </summary>
        public Address ArrivalAddress { get; set; }

        /// <summary>
        /// Груз.
        /// </summary>
        public Cargo Cargo { get; set; }
        
        /// <summary>
        /// Финансовое соглашение.
        /// </summary>
        public PaymentContract PaymentContract { get; set; }
        
        /// <summary>
        /// Состояние контракта.
        /// </summary>
        public CargoTransportationStatus Status { get; set; }
    }
}
