using CurrencyExchangeAPI.Services;

namespace CurrencyExchangeAPI.Services
{
    public class CurrencyUpdateBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<CurrencyUpdateBackgroundService> _logger;
        private readonly TimeSpan _updateInterval = TimeSpan.FromMinutes(3);

        public CurrencyUpdateBackgroundService(
            IServiceProvider serviceProvider,
            ILogger<CurrencyUpdateBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Currency update background service started");

            // Initial update
            await UpdateCurrencyRates();

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await Task.Delay(_updateInterval, stoppingToken);
                    await UpdateCurrencyRates();
                }
                catch (OperationCanceledException)
                {
                    _logger.LogInformation("Currency update background service stopping");
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in currency update background service");
                }
            }
        }

        private async Task UpdateCurrencyRates()
        {
            using var scope = _serviceProvider.CreateScope();
            var currencyService = scope.ServiceProvider.GetRequiredService<ICurrencyService>();
            await currencyService.UpdateRatesAsync();
        }
    }
}