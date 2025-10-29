import { PriceAlert } from '../types';
/**
 * Servis za upozorenja o promeni cene
 */
export declare class AlertService {
    /**
     * Prikaži upozorenje o promeni cene
     */
    displayPriceAlert(alert: PriceAlert): void;
    /**
     * Prikaži više upozorenja
     */
    displayAlerts(alerts: PriceAlert[]): void;
    /**
     * Proveri da li je promena značajna
     */
    isSignificantChange(changePercent: number, threshold: number): boolean;
    /**
     * Formatiraj promena za prikaz
     */
    formatChange(changePercent: number): string;
}
//# sourceMappingURL=alertService.d.ts.map