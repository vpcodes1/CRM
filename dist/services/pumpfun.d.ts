/**
 * Pump.fun API Types
 */
export interface PumpFunToken {
    mint: string;
    name: string;
    symbol: string;
    description: string;
    image_uri: string;
    metadata_uri: string;
    twitter?: string;
    telegram?: string;
    bonding_curve: string;
    associated_bonding_curve: string;
    creator: string;
    created_timestamp: number;
    raydium_pool?: string;
    complete: boolean;
    virtual_sol_reserves: number;
    virtual_token_reserves: number;
    total_supply: number;
    website?: string;
    show_name: boolean;
    king_of_the_hill_timestamp?: number;
    market_cap?: number;
    reply_count: number;
    last_reply?: number;
    nsfw: boolean;
    market_id?: string;
    inverted?: boolean;
    usd_market_cap?: number;
}
/**
 * Pump.fun API Service
 * https://pump.fun - Solana memecoin launchpad
 */
export declare class PumpFunService {
    private api;
    private baseUrl;
    constructor();
    /**
     * Preuzmi sve tokene sa paginacijom
     */
    getTokens(limit?: number, offset?: number, sort?: 'created_timestamp' | 'last_reply' | 'market_cap', order?: 'asc' | 'desc'): Promise<PumpFunToken[]>;
    /**
     * Preuzmi najnovije tokene
     */
    getNewestTokens(limit?: number): Promise<PumpFunToken[]>;
    /**
     * Preuzmi trending tokene
     */
    getTrendingTokens(limit?: number): Promise<PumpFunToken[]>;
    /**
     * Preuzmi tokene sortirane po market cap-u
     */
    getTopByMarketCap(limit?: number): Promise<PumpFunToken[]>;
    /**
     * Pretraži tokene po query-ju
     */
    searchTokens(query: string): Promise<PumpFunToken[]>;
    /**
     * Filtriraj tokene po starosti
     */
    filterByAge(tokens: PumpFunToken[], maxAgeHours: number): PumpFunToken[];
    /**
     * Filtriraj tokene po market cap-u
     */
    filterByMarketCap(tokens: PumpFunToken[], minMarketCap: number): PumpFunToken[];
    /**
     * Formatuj Pump.fun token za prikaz
     */
    formatToken(token: PumpFunToken, index: number): string;
    /**
     * Formatuj listu tokena
     */
    formatTokenList(tokens: PumpFunToken[], title: string): string;
    /**
     * Dobij starost tokena u čitljivom formatu
     */
    private getTokenAge;
    /**
     * Formatiraj brojeve
     */
    private formatNumber;
}
//# sourceMappingURL=pumpfun.d.ts.map