import { DexPair } from '../types';
/**
 * Konfigurisljivi filteri za pronalaženje tokena
 */
export interface DiscoveryFilters {
    minLiquidity?: number;
    minVolume24h?: number;
    maxAgeHours?: number;
    minPriceChange?: number;
    maxPriceChange?: number;
    chains?: string[];
}
/**
 * Servis za automatsko pronalaženje novih i trending tokena
 */
export declare class DiscoveryService {
    private dexService;
    private defaultSafetyFilters;
    private memeSearchTerms;
    constructor();
    /**
     * Multi-search - pretražuje više termina i kombinuje rezultate
     */
    private multiSearch;
    /**
     * Pronađi trending tokene (po volumenu)
     */
    findTrending(searchQuery?: string, limit?: number, filters?: DiscoveryFilters): Promise<DexPair[]>;
    /**
     * Pronađi nove tokene (sveže listinzi)
     */
    findNew(searchQuery?: string, maxAgeHours?: number, limit?: number, filters?: DiscoveryFilters): Promise<DexPair[]>;
    /**
     * Pronađi top gainers (najveći rast)
     */
    findGainers(searchQuery?: string, limit?: number, filters?: DiscoveryFilters): Promise<DexPair[]>;
    /**
     * Pronađi top losers (najveći pad)
     */
    findLosers(searchQuery?: string, limit?: number, filters?: DiscoveryFilters): Promise<DexPair[]>;
    /**
     * Primeni filtere na parove
     */
    private applyFilters;
    /**
     * Formatuj rezultate discovery-ja za prikaz
     */
    formatDiscoveryResults(pairs: DexPair[], title: string): string;
    /**
     * Dobij starost tokena u čitljivom formatu
     */
    private getTokenAge;
    /**
     * Formatiraj brojeve
     */
    private formatNumber;
    /**
     * Dobij preporuke za sigurno trgovanje
     */
    getSafetyTips(pair: DexPair): string[];
    /**
     * Sleep helper
     */
    private sleep;
}
//# sourceMappingURL=discoveryService.d.ts.map