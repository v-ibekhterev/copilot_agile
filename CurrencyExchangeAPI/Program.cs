using CurrencyExchangeAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddHttpClient<ICurrencyService, CurrencyService>();
builder.Services.AddSingleton<ICurrencyService, CurrencyService>();
builder.Services.AddHostedService<CurrencyUpdateBackgroundService>();

// Add CORS for development
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure middleware
app.UseCors();
app.UseStaticFiles();

// API endpoints
app.MapGet("/", () => Results.Redirect("/index.html"));

app.MapGet("/api/currency-rates", async (ICurrencyService currencyService) =>
{
    var rates = await currencyService.GetCurrentRatesAsync();
    return Results.Ok(rates);
});

app.MapPost("/api/update-rates", async (ICurrencyService currencyService) =>
{
    await currencyService.UpdateRatesAsync();
    return Results.Ok(new { message = "Rates updated successfully" });
});

app.Run();
