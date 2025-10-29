import { DexPair, TokenData } from '../types';
/**
 * DEX Screener API servis
 * https://docs.dexscreener.com/api/reference
 */
export declare class DexScreenerService {
    private api;
    private baseUrl;
    constructor();
    /**
     * Preuzmi podatke o tokenu po adresi
     */
    getTokenByAddress(tokenAddress: string): Promise<TokenData | null>;
    /**
     * Preuzmi podatke o paru po adresi
     */
    getPairByAddress(pairAddress: string): Promise<DexPair | null>;
    /**
     * Traži tokene po upitu
     */
    searchTokens(query: string): Promise<DexPair[]>;
    /**
     * Formatuj token podatke za prikaz
     */
    formatTokenData(token: TokenData): string;
    /**
     * Formatiraj brojeve sa skraćenicama (K, M, B)
     */
    private formatNumber;
}
//# sourceMappingURL=dexscreener.d.ts.map