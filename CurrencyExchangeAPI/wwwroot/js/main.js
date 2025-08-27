"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class CurrencyExchangeApp {
    constructor() {
        this.currentRates = [];
        // Currency flags mapping
        this.currencyFlags = {
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
        this.initializeElements();
        this.bindEvents();
        this.loadInitialData();
        this.startAutoRefresh();
    }
    initializeElements() {
        this.ratesContainer = document.getElementById('ratesContainer');
        this.ratesGrid = document.getElementById('ratesGrid');
        this.loadingElement = document.getElementById('loading');
        this.errorMessage = document.getElementById('errorMessage');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.lastUpdatedElement = document.getElementById('lastUpdated');
    }
    bindEvents() {
        this.refreshBtn.addEventListener('click', () => this.refreshRates());
    }
    loadInitialData() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.fetchRates();
        });
    }
    startAutoRefresh() {
        // Refresh every 3 minutes (180000 ms)
        setInterval(() => {
            this.fetchRates(false);
        }, 180000);
    }
    fetchRates() {
        return __awaiter(this, arguments, void 0, function* (showLoading = true) {
            try {
                if (showLoading) {
                    this.showLoading();
                }
                this.setRefreshButtonState(true);
                const response = yield fetch('/api/currency-rates');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const rates = yield response.json();
                this.currentRates = rates;
                this.displayRates();
                this.updateLastUpdatedTime();
                this.hideError();
            }
            catch (error) {
                console.error('Error fetching rates:', error);
                this.showError();
            }
            finally {
                this.hideLoading();
                this.setRefreshButtonState(false);
            }
        });
    }
    refreshRates() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.fetchRates(true);
        });
    }
    displayRates() {
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
    createRateCard(rate) {
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
    formatRate(rate) {
        if (rate >= 100) {
            return rate.toFixed(2);
        }
        else if (rate >= 10) {
            return rate.toFixed(3);
        }
        else if (rate >= 1) {
            return rate.toFixed(4);
        }
        else {
            return rate.toFixed(6);
        }
    }
    showLoading() {
        this.loadingElement.style.display = 'flex';
        this.ratesContainer.style.display = 'none';
        this.errorMessage.style.display = 'none';
    }
    hideLoading() {
        this.loadingElement.style.display = 'none';
    }
    showError() {
        this.errorMessage.style.display = 'block';
        this.ratesContainer.style.display = 'none';
        this.loadingElement.style.display = 'none';
    }
    hideError() {
        this.errorMessage.style.display = 'none';
    }
    setRefreshButtonState(disabled) {
        this.refreshBtn.disabled = disabled;
        this.refreshBtn.innerHTML = disabled ? '🔄 Refreshing...' : '🔄 Refresh Now';
    }
    updateLastUpdatedTime() {
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
//# sourceMappingURL=main.js.map