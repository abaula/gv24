namespace Gv24.ApiContracts.v1_0
{
    /// <summary>
    /// Набор данных с указанием существуют ли ещё записи.
    /// </summary>
    /// <typeparam name="TItem">Тип данных.</typeparam>
    public class DataFrame<TItem>
        where TItem : class
    {
        public TItem[] Items { get; set; }
        public bool HasNext { get; set; }
    }
}