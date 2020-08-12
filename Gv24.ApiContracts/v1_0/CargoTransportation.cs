
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
        public Address DepartureAddress;

        /// <summary>
        /// Адрес прибытия.
        /// </summary>
        public Address ArrivalAddress;

        /// <summary>
        /// Груз.
        /// </summary>
        public Cargo Cargo;
        
        /// <summary>
        /// Финансовое соглашение.
        /// </summary>
        public PaymentContract PaymentContract;
        
        /// <summary>
        /// Состояние контракта.
        /// </summary>
        public CargoTransportationStatus Status;
    }
}
