/**
 * Jupiter Token Interface
 */
export interface JupiterToken {
    address: string;
    chainId: number;
    decimals: number;
    name: string;
    symbol: string;
    logoURI?: string;
    tags?: string[];
    extensions?: {
        coingeckoId?: string;
    };
}
/**
 * Jupiter Price Data
 */
export interface JupiterPrice {
    id: string;
    mintSymbol: string;
    vsToken: string;
    vsTokenSymbol: string;
    price: number;
}
/**
 * Enriched Token sa cenom i dodatnim info
 */
export interface EnrichedJupiterToken extends JupiterToken {
    priceUsd?: number;
    volume24h?: number;
    priceChange24h?: number;
    marketCap?: number;
    createdAt?: number;
}
/**
 * Jupiter Aggregator servis za Solana tokene
 *
 * Jupiter je najveći DEX aggregator na Solana chain-u.
 * Ima listu svih tokena i real-time price data.
 */
export declare class JupiterService {
    private jupiterApi;
    private priceApi;
    private tokenCache;
    private cacheTime;
    private CACHE_DURATION;
    constructor();
    /**
     * Preuzmi SVE Solana tokene sa Jupiter-a
     */
    getAllTokens(forceRefresh?: boolean): Promise<JupiterToken[]>;
    /**
     * Preuzmi cene za tokene
     */
    getPrices(tokenAddresses: string[]): Promise<Map<string, number>>;
    /**
     * Pronađi nove tokene (tokens sa recent timestamp-om u nazivu ili opisu)
     *
     * NAPOMENA: Jupiter ne pruža creation timestamp direktno.
     * Ova metoda koristi heuristiku za pronalaženje novih tokena.
     */
    getRecentTokens(limit?: number): Promise<EnrichedJupiterToken[]>;
    /**
     * Pretraži tokene po nazivu/simbolu
     */
    searchTokens(query: string, limit?: number): Promise<EnrichedJupiterToken[]>;
    /**
     * Preuzmi popularne tokene (oni sa coingecko ID-om)
     */
    getPopularTokens(limit?: number): Promise<EnrichedJupiterToken[]>;
    /**
     * Formatiraj tokene za prikaz
     */
    formatTokens(tokens: EnrichedJupiterToken[], title: string): string;
    /**
     * Format price helper
     */
    private formatPrice;
    /**
     * Chunk array helper
     */
    private chunkArray;
    /**
     * Sleep helper
     */
    private sleep;
    /**
     * Get token count
     */
    getTokenCount(): number;
    /**
     * Clear cache
     */
    clearCache(): void;
}
//# sourceMappingURL=jupiter.d.ts.map