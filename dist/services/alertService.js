"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertService = void 0;
/**
 * Servis za upozorenja o promeni cene
 */
class AlertService {
    /**
     * Prikaži upozorenje o promeni cene
     */
    displayPriceAlert(alert) {
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
    displayAlerts(alerts) {
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
    isSignificantChange(changePercent, threshold) {
        return Math.abs(changePercent) >= threshold;
    }
    /**
     * Formatiraj promena za prikaz
     */
    formatChange(changePercent) {
        const sign = changePercent >= 0 ? '+' : '';
        return `${sign}${changePercent.toFixed(2)}%`;
    }
}
exports.AlertService = AlertService;
//# sourceMappingURL=alertService.js.map