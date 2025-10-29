"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JupiterService = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * Jupiter Aggregator servis za Solana tokene
 *
 * Jupiter je najveći DEX aggregator na Solana chain-u.
 * Ima listu svih tokena i real-time price data.
 */
class JupiterService {
    constructor() {
        this.tokenCache = [];
        this.cacheTime = 0;
        this.CACHE_DURATION = 5 * 60 * 1000; // 5 minuta
        // Jupiter Token List API
        this.jupiterApi = axios_1.default.create({
            baseURL: 'https://token.jup.ag',
            timeout: 10000,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
        });
        // Jupiter Price API v2
        this.priceApi = axios_1.default.create({
            baseURL: 'https://api.jup.ag',
            timeout: 10000,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
        });
    }
    /**
     * Preuzmi SVE Solana tokene sa Jupiter-a
     */
    async getAllTokens(forceRefresh = false) {
        // Proveri cache
        if (!forceRefresh && this.tokenCache.length > 0 && Date.now() - this.cacheTime < this.CACHE_DURATION) {
            console.log(`📦 Korišćen cache (${this.tokenCache.length} tokena)`);
            return this.tokenCache;
        }
        try {
            console.log('🔄 Preuzimanje token liste sa Jupiter-a...');
            // Jupiter strict token list (verified tokens)
            const response = await this.jupiterApi.get('/strict');
            this.tokenCache = response.data;
            this.cacheTime = Date.now();
            console.log(`✅ Preuzeto ${this.tokenCache.length} tokena`);
            return this.tokenCache;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                console.error('❌ Jupiter API greška:', error.message);
                if (error.response?.status === 403) {
                    console.log('⚠️  API blokiran - probajte sa /all endpoint-om ili localhost-a');
                }
            }
            throw error;
        }
    }
    /**
     * Preuzmi cene za tokene
     */
    async getPrices(tokenAddresses) {
        if (tokenAddresses.length === 0)
            return new Map();
        try {
            // Jupiter Price API v2 - max 100 tokena po request-u
            const chunks = this.chunkArray(tokenAddresses, 100);
            const priceMap = new Map();
            for (const chunk of chunks) {
                const ids = chunk.join(',');
                const response = await this.priceApi.get(`/price/v2?ids=${ids}`);
                // Parse response
                for (const [address, priceData] of Object.entries(response.data.data)) {
                    priceMap.set(address, priceData.price);
                }
                // Rate limiting
                if (chunks.length > 1) {
                    await this.sleep(200);
                }
            }
            return priceMap;
        }
        catch (error) {
            console.error('❌ Greška pri preuzimanju cena:', error);
            return new Map();
        }
    }
    /**
     * Pronađi nove tokene (tokens sa recent timestamp-om u nazivu ili opisu)
     *
     * NAPOMENA: Jupiter ne pruža creation timestamp direktno.
     * Ova metoda koristi heuristiku za pronalaženje novih tokena.
     */
    async getRecentTokens(limit = 50) {
        try {
            const allTokens = await this.getAllTokens();
            // Filter: tokens sa tags "community" ili bez coingecko ID (usually newer)
            const potentialNewTokens = allTokens.filter(token => {
                const hasNoCoinGecko = !token.extensions?.coingeckoId;
                const hasCommunityTag = token.tags?.includes('community');
                return hasNoCoinGecko || hasCommunityTag;
            });
            console.log(`🔍 Pronađeno ${potentialNewTokens.length} potencijalno novih tokena`);
            // Uzmi random sample ako ima previše
            const sample = potentialNewTokens
                .sort(() => Math.random() - 0.5)
                .slice(0, limit);
            // Preuzmi cene
            const addresses = sample.map(t => t.address);
            const prices = await this.getPrices(addresses);
            // Enrichuj sa cenama
            const enriched = sample.map(token => ({
                ...token,
                priceUsd: prices.get(token.address) || 0,
            }));
            // Sortiraj po ceni (manji = noviji obično)
            return enriched.sort((a, b) => (a.priceUsd || 0) - (b.priceUsd || 0));
        }
        catch (error) {
            console.error('❌ Greška pri pronalaženju novih tokena:', error);
            return [];
        }
    }
    /**
     * Pretraži tokene po nazivu/simbolu
     */
    async searchTokens(query, limit = 20) {
        try {
            const allTokens = await this.getAllTokens();
            const lowerQuery = query.toLowerCase();
            // Search po nazivu i simbolu
            const results = allTokens.filter(token => {
                const matchName = token.name.toLowerCase().includes(lowerQuery);
                const matchSymbol = token.symbol.toLowerCase().includes(lowerQuery);
                return matchName || matchSymbol;
            }).slice(0, limit);
            // Preuzmi cene
            const addresses = results.map(t => t.address);
            const prices = await this.getPrices(addresses);
            // Enrichuj
            const enriched = results.map(token => ({
                ...token,
                priceUsd: prices.get(token.address) || 0,
            }));
            return enriched;
        }
        catch (error) {
            console.error('❌ Greška pri pretrazi:', error);
            return [];
        }
    }
    /**
     * Preuzmi popularne tokene (oni sa coingecko ID-om)
     */
    async getPopularTokens(limit = 20) {
        try {
            const allTokens = await this.getAllTokens();
            // Filter: tokeni sa coingecko ID-om (verified/popular)
            const popularTokens = allTokens
                .filter(token => token.extensions?.coingeckoId)
                .slice(0, limit);
            // Preuzmi cene
            const addresses = popularTokens.map(t => t.address);
            const prices = await this.getPrices(addresses);
            // Enrichuj
            const enriched = popularTokens.map(token => ({
                ...token,
                priceUsd: prices.get(token.address) || 0,
            }));
            // Sortiraj po ceni (veće = popularnije obično)
            return enriched.sort((a, b) => (b.priceUsd || 0) - (a.priceUsd || 0));
        }
        catch (error) {
            console.error('❌ Greška pri preuzimanju popularnih tokena:', error);
            return [];
        }
    }
    /**
     * Formatiraj tokene za prikaz
     */
    formatTokens(tokens, title) {
        if (tokens.length === 0) {
            return `\n${title}\n${'═'.repeat(60)}\n\n❌ Nema tokena za prikaz.\n`;
        }
        let output = `\n${title}\n${'═'.repeat(60)}\n\n`;
        tokens.forEach((token, index) => {
            const price = token.priceUsd && token.priceUsd > 0
                ? `$${this.formatPrice(token.priceUsd)}`
                : 'N/A';
            const tags = token.tags && token.tags.length > 0
                ? ` [${token.tags.join(', ')}]`
                : '';
            const verified = token.extensions?.coingeckoId ? '✓' : '';
            output += `${index + 1}. ${verified} ${token.name} (${token.symbol})${tags}\n`;
            output += `   Cena: ${price}\n`;
            output += `   Adresa: ${token.address}\n`;
            if (token.logoURI) {
                output += `   Logo: ${token.logoURI}\n`;
            }
            output += '\n';
        });
        output += `\n💡 Pronađeno: ${tokens.length} tokena\n`;
        output += `📊 Jupiter Aggregator - Solana chain\n`;
        return output;
    }
    /**
     * Format price helper
     */
    formatPrice(price) {
        if (price >= 1) {
            return price.toFixed(4);
        }
        else if (price >= 0.01) {
            return price.toFixed(6);
        }
        else if (price >= 0.0001) {
            return price.toFixed(8);
        }
        else {
            return price.toExponential(4);
        }
    }
    /**
     * Chunk array helper
     */
    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
    /**
     * Sleep helper
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Get token count
     */
    getTokenCount() {
        return this.tokenCache.length;
    }
    /**
     * Clear cache
     */
    clearCache() {
        this.tokenCache = [];
        this.cacheTime = 0;
        console.log('🗑️  Cache očišćen');
    }
}
exports.JupiterService = JupiterService;
//# sourceMappingURL=jupiter.js.map