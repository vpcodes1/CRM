import { PriceAlert } from '../types';

/**
 * Servis za upozorenja o promeni cene
 */
export class AlertService {
  /**
   * Prikaži upozorenje o promeni cene
   */
  displayPriceAlert(alert: PriceAlert): void {
    const isPositive = alert.changePercent >= 0;
    const emoji = isPositive ? '🚀' : '⚠️';
    const arrow = isPositive ? '⬆️' : '⬇️';
    const sign = isPositive ? '+' : '';

    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${emoji} ALERT: PROMENA CENE ${emoji}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💎 Token: ${alert.tokenSymbol}
${arrow} Promena: ${sign}${alert.changePercent.toFixed(2)}%
📊 Stara cena: $${alert.oldPrice.toFixed(alert.oldPrice < 0.01 ? 8 : 4)}
💰 Nova cena: $${alert.newPrice.toFixed(alert.newPrice < 0.01 ? 8 : 4)}
🕐 Vreme: ${alert.timestamp.toLocaleString('sr-RS')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  }

  /**
   * Prikaži više upozorenja
   */
  displayAlerts(alerts: PriceAlert[]): void {
    if (alerts.length === 0) {
      return;
    }

    console.log(`\n🔔 ${alerts.length} NOVO${alerts.length === 1 ? '' : 'IH'} UPOZORENJA:\n`);

    alerts.forEach(alert => {
      this.displayPriceAlert(alert);
    });
  }

  /**
   * Proveri da li je promena značajna
   */
  isSignificantChange(changePercent: number, threshold: number): boolean {
    return Math.abs(changePercent) >= threshold;
  }

  /**
   * Formatiraj promena za prikaz
   */
  formatChange(changePercent: number): string {
    const sign = changePercent >= 0 ? '+' : '';
    return `${sign}${changePercent.toFixed(2)}%`;
  }
}
