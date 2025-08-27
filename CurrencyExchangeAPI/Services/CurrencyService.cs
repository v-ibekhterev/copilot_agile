using CurrencyExchangeAPI.Models;
using System.Text.Json;

namespace CurrencyExchangeAPI.Services
{
    public interface ICurrencyService
    {
        Task<List<CurrencyRate>> GetCurrentRatesAsync();
        Task UpdateRatesAsync();
    }

    public class CurrencyService : ICurrencyService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<CurrencyService> _logger;
        private readonly List<CurrencyRate> _currentRates;
        private readonly object _lockObject = new();

        // Using exchangerate-api.com free tier (1500 requests/month)
        private const string BASE_URL = "https://api.exchangerate-api.com/v4/latest/USD";

        public CurrencyService(HttpClient httpClient, ILogger<CurrencyService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
            _currentRates = new List<CurrencyRate>();
            
            // Initialize with some default rates
            InitializeDefaultRates();
        }

        public Task<List<CurrencyRate>> GetCurrentRatesAsync()
        {
            lock (_lockObject)
            {
                return Task.FromResult(new List<CurrencyRate>(_currentRates));
            }
        }

        public async Task UpdateRatesAsync()
        {
            try
            {
                _logger.LogInformation("Fetching currency rates from API...");
                
                var response = await _httpClient.GetAsync(BASE_URL);
                response.EnsureSuccessStatusCode();
                
                var jsonContent = await response.Content.ReadAsStringAsync();
                var exchangeData = JsonSerializer.Deserialize<ExchangeRateResponse>(jsonContent, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (exchangeData?.Success == true && exchangeData.Rates != null)
                {
                    var newRates = new List<CurrencyRate>();
                    var updateTime = DateTime.UtcNow;
                    
                    // Popular currency pairs
                    var popularCurrencies = new[] { "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR", "BRL", "RUB" };
                    
                    foreach (var currency in popularCurrencies)
                    {
                        if (exchangeData.Rates.TryGetValue(currency, out var rate))
                        {
                            newRates.Add(new CurrencyRate
                            {
                                CurrencyPair = $"USD/{currency}",
                                BaseCurrency = "USD",
                                TargetCurrency = currency,
                                Rate = rate,
                                LastUpdated = updateTime
                            });
                        }
                    }

                    lock (_lockObject)
                    {
                        _currentRates.Clear();
                        _currentRates.AddRange(newRates);
                    }

                    _logger.LogInformation($"Successfully updated {newRates.Count} currency rates");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating currency rates");
            }
        }

        private void InitializeDefaultRates()
        {
            var defaultRates = new[]
            {
                new CurrencyRate { CurrencyPair = "USD/EUR", BaseCurrency = "USD", TargetCurrency = "EUR", Rate = 0.85m, LastUpdated = DateTime.UtcNow },
                new CurrencyRate { CurrencyPair = "USD/GBP", BaseCurrency = "USD", TargetCurrency = "GBP", Rate = 0.73m, LastUpdated = DateTime.UtcNow },
                new CurrencyRate { CurrencyPair = "USD/JPY", BaseCurrency = "USD", TargetCurrency = "JPY", Rate = 110.50m, LastUpdated = DateTime.UtcNow },
                new CurrencyRate { CurrencyPair = "USD/CAD", BaseCurrency = "USD", TargetCurrency = "CAD", Rate = 1.25m, LastUpdated = DateTime.UtcNow },
                new CurrencyRate { CurrencyPair = "USD/AUD", BaseCurrency = "USD", TargetCurrency = "AUD", Rate = 1.35m, LastUpdated = DateTime.UtcNow }
            };

            _currentRates.AddRange(defaultRates);
        }
    }
}