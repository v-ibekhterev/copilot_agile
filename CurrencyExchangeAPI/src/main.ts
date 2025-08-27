interface CurrencyRate {
    currencyPair: string;
    rate: number;
    lastUpdated: string;
    baseCurrency: string;
    targetCurrency: string;
}

interface ApiResponse {
    success?: boolean;
    data?: CurrencyRate[];
    message?: string;
}

class CurrencyExchangeApp {
    private ratesContainer!: HTMLElement;
    private ratesGrid!: HTMLElement;
    private loadingElement!: HTMLElement;
    private errorMessage!: HTMLElement;
    private refreshBtn!: HTMLButtonElement;
    private lastUpdatedElement!: HTMLElement;
    private currentRates: CurrencyRate[] = [];

    // Currency flags mapping
    private currencyFlags: { [key: string]: string } = {
        'USD': '🇺🇸',
        'EUR': '🇪🇺',
        'GBP': '🇬🇧',
        'JPY': '🇯🇵',
        'CAD': '🇨🇦',
        'AUD': '🇦🇺',
        'CHF': '🇨🇭',
        'CNY': '🇨🇳',
        'INR': '🇮🇳',
        'BRL': '🇧🇷',
        'RUB': '🇷🇺'
    };

    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.loadInitialData();
        this.startAutoRefresh();
    }

    private initializeElements(): void {
        this.ratesContainer = document.getElementById('ratesContainer')!;
        this.ratesGrid = document.getElementById('ratesGrid')!;
        this.loadingElement = document.getElementById('loading')!;
        this.errorMessage = document.getElementById('errorMessage')!;
        this.refreshBtn = document.getElementById('refreshBtn') as HTMLButtonElement;
        this.lastUpdatedElement = document.getElementById('lastUpdated')!;
    }

    private bindEvents(): void {
        this.refreshBtn.addEventListener('click', () => this.refreshRates());
    }

    private async loadInitialData(): Promise<void> {
        await this.fetchRates();
    }

    private startAutoRefresh(): void {
        // Refresh every 3 minutes (180000 ms)
        setInterval(() => {
            this.fetchRates(false);
        }, 180000);
    }

    private async fetchRates(showLoading: boolean = true): Promise<void> {
        try {
            if (showLoading) {
                this.showLoading();
            }

            this.setRefreshButtonState(true);

            const response = await fetch('/api/currency-rates');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const rates: CurrencyRate[] = await response.json();
            
            this.currentRates = rates;
            this.displayRates();
            this.updateLastUpdatedTime();
            this.hideError();

        } catch (error) {
            console.error('Error fetching rates:', error);
            this.showError();
        } finally {
            this.hideLoading();
            this.setRefreshButtonState(false);
        }
    }

    private async refreshRates(): Promise<void> {
        await this.fetchRates(true);
    }

    private displayRates(): void {
        if (this.currentRates.length === 0) {
            this.showError();
            return;
        }

        this.ratesGrid.innerHTML = '';

        this.currentRates.forEach(rate => {
            const rateCard = this.createRateCard(rate);
            this.ratesGrid.appendChild(rateCard);
        });

        this.ratesContainer.classList.add('visible');
    }

    private createRateCard(rate: CurrencyRate): HTMLElement {
        const card = document.createElement('div');
        card.className = 'rate-card';

        const targetFlag = this.currencyFlags[rate.targetCurrency] || '💱';
        const baseFlag = this.currencyFlags[rate.baseCurrency] || '💱';

        // Format rate with appropriate decimal places
        const formattedRate = this.formatRate(rate.rate);
        
        // Format the last updated time
        const updatedTime = new Date(rate.lastUpdated).toLocaleTimeString();

        card.innerHTML = `
            <div class="currency-pair">
                <span class="currency-flag">${baseFlag}</span>
                <span>${rate.currencyPair}</span>
                <span class="currency-flag">${targetFlag}</span>
            </div>
            <div class="rate-value">${formattedRate}</div>
            <div class="rate-change neutral">
                1 ${rate.baseCurrency} = ${formattedRate} ${rate.targetCurrency}
            </div>
            <div class="rate-updated">Updated: ${updatedTime}</div>
        `;

        return card;
    }

    private formatRate(rate: number): string {
        if (rate >= 100) {
            return rate.toFixed(2);
        } else if (rate >= 10) {
            return rate.toFixed(3);
        } else if (rate >= 1) {
            return rate.toFixed(4);
        } else {
            return rate.toFixed(6);
        }
    }

    private showLoading(): void {
        this.loadingElement.style.display = 'flex';
        this.ratesContainer.style.display = 'none';
        this.errorMessage.style.display = 'none';
    }

    private hideLoading(): void {
        this.loadingElement.style.display = 'none';
    }

    private showError(): void {
        this.errorMessage.style.display = 'block';
        this.ratesContainer.style.display = 'none';
        this.loadingElement.style.display = 'none';
    }

    private hideError(): void {
        this.errorMessage.style.display = 'none';
    }

    private setRefreshButtonState(disabled: boolean): void {
        this.refreshBtn.disabled = disabled;
        this.refreshBtn.innerHTML = disabled ? '🔄 Refreshing...' : '🔄 Refresh Now';
    }

    private updateLastUpdatedTime(): void {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        this.lastUpdatedElement.textContent = timeString;
    }
}

// Initialize the application when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new CurrencyExchangeApp();
});

// Add some global error handling
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});