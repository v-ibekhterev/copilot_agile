namespace CurrencyExchangeAPI.Models
{
    public class CurrencyRate
    {
        public string CurrencyPair { get; set; } = string.Empty;
        public decimal Rate { get; set; }
        public DateTime LastUpdated { get; set; }
        public string BaseCurrency { get; set; } = string.Empty;
        public string TargetCurrency { get; set; } = string.Empty;
    }

    public class ExchangeRateResponse
    {
        public bool Success { get; set; }
        public Dictionary<string, decimal> Rates { get; set; } = new();
        public string Base { get; set; } = string.Empty;
        public DateTime Date { get; set; }
    }
}