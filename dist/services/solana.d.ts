import { DexPair } from '../types';
/**
 * Solana Token Service
 * Koristi više izvora za pronalaženje Solana tokena
 */
export declare class SolanaService {
    private api;
    private dexScreenerApi;
    constructor();
    /**
     * Preuzmi najnovije tokene na Solana chain-u
     * Koristi DEX Screener "trending" kao proxy za nove tokene
     */
    getNewestTokens(maxAgeHours?: number): Promise<DexPair[]>;
    /**
     * Preuzmi trending Solana tokene (po volumenu)
     */
    getTrendingTokens(limit?: number): Promise<DexPair[]>;
    /**
     * Preuzmi top gainers na Solana
     */
    getTopGainers(limit?: number): Promise<DexPair[]>;
    /**
     * Preuzmi sve Solana tokene sa filterima
     */
    getSolanaTokens(filters?: {
        minLiquidity?: number;
        minVolume24h?: number;
        maxAgeHours?: number;
    }): Promise<DexPair[]>;
    /**
     * Formatuj token podatke
     */
    formatTokens(pairs: DexPair[], title: string): string;
    /**
     * Dobij starost tokena
     */
    private getTokenAge;
    /**
     * Formatiraj brojeve
     */
    private formatNumber;
    /**
     * Sleep helper
     */
    private sleep;
}
//# sourceMappingURL=solana.d.ts.map