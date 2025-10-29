"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceTrackerService = void 0;
const dexscreener_1 = require("./dexscreener");
/**
 * Servis za praćenje cena tokena
 */
class PriceTrackerService {
    constructor() {
        this.dexService = new dexscreener_1.DexScreenerService();
        this.trackedTokens = new Map();
        this.priceHistory = new Map();
    }
    /**
     * Dodaj token za praćenje
     */
    async addToken(tokenAddress) {
        const tokenData = await this.dexService.getTokenByAddress(tokenAddress);
        if (!tokenData) {
            return false;
        }
        this.trackedTokens.set(tokenAddress, tokenData);
        this.priceHistory.set(tokenAddress, [tokenData.price]);
        console.log(`✅ Token ${tokenData.symbol} dodat u praćenje`);
        console.log(this.dexService.formatTokenData(tokenData));
        return true;
    }
    /**
     * Ukloni token iz praćenja
     */
    removeToken(tokenAddress) {
        if (this.trackedTokens.has(tokenAddress)) {
            const token = this.trackedTokens.get(tokenAddress);
            this.trackedTokens.delete(tokenAddress);
            this.priceHistory.delete(tokenAddress);
            console.log(`🗑️  Token ${token?.symbol} uklonjen iz praćenja`);
            return true;
        }
        return false;
    }
    /**
     * Ažuriraj podatke za sve praćene tokene
     */
    async updateAllTokens(alertThreshold = 5) {
        const alerts = [];
        for (const [address, oldData] of this.trackedTokens.entries()) {
            try {
                const newData = await this.dexService.getTokenByAddress(address);
                if (!newData) {
                    continue;
                }
                // Ažuriraj podatke
                this.trackedTokens.set(address, newData);
                // Dodaj u istoriju cena
                const history = this.priceHistory.get(address) || [];
                history.push(newData.price);
                // Zadrži samo poslednjih 100 unosa
                if (history.length > 100) {
                    history.shift();
                }
                this.priceHistory.set(address, history);
                // Proveri da li treba napraviti alert
                const priceChange = ((newData.price - oldData.price) / oldData.price) * 100;
                if (Math.abs(priceChange) >= alertThreshold) {
                    const alert = {
                        tokenAddress: address,
                        tokenSymbol: newData.symbol,
                        oldPrice: oldData.price,
                        newPrice: newData.price,
                        changePercent: priceChange,
                        timestamp: new Date(),
                    };
                    alerts.push(alert);
                }
                // Male pauze između poziva da izbegnemo rate limiting
                await this.sleep(500);
            }
            catch (error) {
                console.error(`❌ Greška pri ažuriranju tokena ${address}:`, error);
            }
        }
        return alerts;
    }
    /**
     * Prikaži sve praćene tokene
     */
    displayTrackedTokens() {
        if (this.trackedTokens.size === 0) {
            console.log('📭 Nema praćenih tokena');
            return;
        }
        console.log('\n📊 PRAĆENI TOKENI:\n');
        for (const token of this.trackedTokens.values()) {
            console.log(this.dexService.formatTokenData(token));
            console.log('');
        }
    }
    /**
     * Prikaži istoriju cena za token
     */
    displayPriceHistory(tokenAddress, limit = 10) {
        const token = this.trackedTokens.get(tokenAddress);
        const history = this.priceHistory.get(tokenAddress);
        if (!token || !history) {
            console.log('❌ Token nije pronađen u praćenju');
            return;
        }
        console.log(`\n📈 ISTORIJA CENA - ${token.symbol}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        const recentHistory = history.slice(-limit);
        recentHistory.forEach((price, index) => {
            const emoji = index > 0 && price > recentHistory[index - 1] ? '🟢' : index > 0 ? '🔴' : '⚪';
            console.log(`${emoji} $${price.toFixed(price < 0.01 ? 8 : 4)}`);
        });
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }
    /**
     * Statistika za token
     */
    getTokenStats(tokenAddress) {
        const token = this.trackedTokens.get(tokenAddress);
        const history = this.priceHistory.get(tokenAddress);
        if (!token || !history || history.length < 2) {
            return null;
        }
        const prices = history;
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        const currentPrice = token.price;
        return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 STATISTIKA - ${token.symbol}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Trenutna cena: $${currentPrice.toFixed(currentPrice < 0.01 ? 8 : 4)}
📉 Minimum: $${minPrice.toFixed(minPrice < 0.01 ? 8 : 4)}
📈 Maximum: $${maxPrice.toFixed(maxPrice < 0.01 ? 8 : 4)}
📊 Prosek: $${avgPrice.toFixed(avgPrice < 0.01 ? 8 : 4)}
📏 Broj merenja: ${prices.length}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();
    }
    /**
     * Dobij sve praćene tokene
     */
    getTrackedTokens() {
        return Array.from(this.trackedTokens.values());
    }
    /**
     * Pomočna funkcija za sleep
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.PriceTrackerService = PriceTrackerService;
//# sourceMappingURL=priceTracker.js.map