namespace Gv24.ApiContracts.v1_0
{
    /// <summary>
    /// Поисковый запрос.
    /// </summary>
    public class SearchRequest
    {
        public string Query { get; set; }
        public int Skip { get; set; }
        public int Take { get; set; }
    }
}