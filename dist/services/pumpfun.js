"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PumpFunService = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * Pump.fun API Service
 * https://pump.fun - Solana memecoin launchpad
 */
class PumpFunService {
    constructor() {
        this.baseUrl = 'https://frontend-api.pump.fun';
        this.api = axios_1.default.create({
            baseURL: this.baseUrl,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    /**
     * Preuzmi sve tokene sa paginacijom
     */
    async getTokens(limit = 50, offset = 0, sort = 'created_timestamp', order = 'desc') {
        try {
            const response = await this.api.get('/coins', {
                params: {
                    limit,
                    offset,
                    sort,
                    order,
                    includeNsfw: false, // Ne prikazuj NSFW tokene
                },
            });
            return response.data || [];
        }
        catch (error) {
            console.error('❌ Greška pri preuzimanju Pump.fun tokena:', error.message);
            return [];
        }
    }
    /**
     * Preuzmi najnovije tokene
     */
    async getNewestTokens(limit = 20) {
        return this.getTokens(limit, 0, 'created_timestamp', 'desc');
    }
    /**
     * Preuzmi trending tokene
     */
    async getTrendingTokens(limit = 20) {
        try {
            const response = await this.api.get('/coins/trending', {
                params: {
                    limit,
                    includeNsfw: false,
                },
            });
            return response.data || [];
        }
        catch (error) {
            console.error('❌ Greška pri preuzimanju trending tokena sa Pump.fun:', error.message);
            return [];
        }
    }
    /**
     * Preuzmi tokene sortirane po market cap-u
     */
    async getTopByMarketCap(limit = 20) {
        return this.getTokens(limit, 0, 'market_cap', 'desc');
    }
    /**
     * Pretraži tokene po query-ju
     */
    async searchTokens(query) {
        try {
            const allTokens = await this.getTokens(100, 0, 'market_cap', 'desc');
            const searchLower = query.toLowerCase();
            return allTokens.filter(token => token.name.toLowerCase().includes(searchLower) ||
                token.symbol.toLowerCase().includes(searchLower) ||
                token.description?.toLowerCase().includes(searchLower));
        }
        catch (error) {
            console.error('❌ Greška pri pretrazi Pump.fun tokena:', error.message);
            return [];
        }
    }
    /**
     * Filtriraj tokene po starosti
     */
    filterByAge(tokens, maxAgeHours) {
        const now = Date.now();
        const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
        return tokens.filter(token => {
            const age = now - token.created_timestamp;
            return age <= maxAgeMs;
        });
    }
    /**
     * Filtriraj tokene po market cap-u
     */
    filterByMarketCap(tokens, minMarketCap) {
        return tokens.filter(token => {
            return token.usd_market_cap && token.usd_market_cap >= minMarketCap;
        });
    }
    /**
     * Formatuj Pump.fun token za prikaz
     */
    formatToken(token, index) {
        const age = this.getTokenAge(token.created_timestamp);
        const marketCap = token.usd_market_cap
            ? `$${this.formatNumber(token.usd_market_cap)}`
            : 'N/A';
        const completed = token.complete ? '✅ Graduated' : '🔄 Bonding';
        const hasRaydium = token.raydium_pool ? '🔥 Raydium' : '';
        let output = `${index + 1}. 💎 ${token.name} (${token.symbol})\n`;
        output += `   📊 Market Cap: ${marketCap}\n`;
        output += `   ⏰ Starost: ${age}\n`;
        output += `   📍 Status: ${completed} ${hasRaydium}\n`;
        if (token.description && token.description.length > 0) {
            const desc = token.description.substring(0, 60);
            output += `   📝 ${desc}${token.description.length > 60 ? '...' : ''}\n`;
        }
        if (token.twitter)
            output += `   🐦 Twitter\n`;
        if (token.telegram)
            output += `   📱 Telegram\n`;
        if (token.website)
            output += `   🌐 Website\n`;
        output += `   📍 Mint: ${token.mint}\n`;
        output += `\n`;
        return output;
    }
    /**
     * Formatuj listu tokena
     */
    formatTokenList(tokens, title) {
        if (tokens.length === 0) {
            return '\n❌ Nema pronađenih Pump.fun tokena.\n';
        }
        let output = `\n${'═'.repeat(60)}\n`;
        output += `  ${title}\n`;
        output += `${'═'.repeat(60)}\n\n`;
        tokens.forEach((token, index) => {
            output += this.formatToken(token, index);
        });
        output += `${'═'.repeat(60)}\n`;
        output += `💡 Da dodate token: add <mint_adresa>\n`;
        output += `💡 Pump.fun: https://pump.fun/coin/${tokens[0]?.mint || ''}\n`;
        output += `${'═'.repeat(60)}\n`;
        return output;
    }
    /**
     * Dobij starost tokena u čitljivom formatu
     */
    getTokenAge(timestamp) {
        const now = Date.now();
        const ageMs = now - timestamp;
        const ageHours = ageMs / (1000 * 60 * 60);
        const ageDays = ageHours / 24;
        if (ageDays >= 1) {
            return `${Math.floor(ageDays)} dana`;
        }
        else if (ageHours >= 1) {
            return `${Math.floor(ageHours)} sati`;
        }
        else {
            const ageMinutes = ageMs / (1000 * 60);
            return `${Math.floor(ageMinutes)} minuta`;
        }
    }
    /**
     * Formatiraj brojeve
     */
    formatNumber(num) {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(2) + 'B';
        }
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(2) + 'K';
        }
        return num.toFixed(2);
    }
}
exports.PumpFunService = PumpFunService;
//# sourceMappingURL=pumpfun.js.map