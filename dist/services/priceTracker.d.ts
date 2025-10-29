import { TokenData, PriceAlert } from '../types';
/**
 * Servis za praćenje cena tokena
 */
export declare class PriceTrackerService {
    private dexService;
    private trackedTokens;
    private priceHistory;
    constructor();
    /**
     * Dodaj token za praćenje
     */
    addToken(tokenAddress: string): Promise<boolean>;
    /**
     * Ukloni token iz praćenja
     */
    removeToken(tokenAddress: string): boolean;
    /**
     * Ažuriraj podatke za sve praćene tokene
     */
    updateAllTokens(alertThreshold?: number): Promise<PriceAlert[]>;
    /**
     * Prikaži sve praćene tokene
     */
    displayTrackedTokens(): void;
    /**
     * Prikaži istoriju cena za token
     */
    displayPriceHistory(tokenAddress: string, limit?: number): void;
    /**
     * Statistika za token
     */
    getTokenStats(tokenAddress: string): string | null;
    /**
     * Dobij sve praćene tokene
     */
    getTrackedTokens(): TokenData[];
    /**
     * Pomočna funkcija za sleep
     */
    private sleep;
}
//# sourceMappingURL=priceTracker.d.ts.map