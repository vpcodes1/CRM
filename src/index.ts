#!/usr/bin/env node

import * as readline from 'readline';
import { PriceTrackerService } from './services/priceTracker';
import { AlertService } from './services/alertService';
import { DexScreenerService } from './services/dexscreener';
import { loadConfig, validateConfig } from './config';

/**
 * Glavni bot za praćenje meme coina
 */
class MemecoinBot {
  private tracker: PriceTrackerService;
  private alertService: AlertService;
  private dexService: DexScreenerService;
  private intervalId?: NodeJS.Timeout;
  private isRunning: boolean = false;
  private rl: readline.Interface;

  constructor() {
    this.tracker = new PriceTrackerService();
    this.alertService = new AlertService();
    this.dexService = new DexScreenerService();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  /**
   * Pokreni bota
   */
  async start(): Promise<void> {
    console.clear();
    this.displayBanner();

    const config = loadConfig();

    if (!validateConfig(config)) {
      console.error('❌ Nevalidna konfiguracija. Proverite .env fajl.');
      process.exit(1);
    }

    // Dodaj tokene iz konfiguracije
    if (config.tokenAddresses.length > 0) {
      console.log(`\n📥 Učitavanje ${config.tokenAddresses.length} tokena iz konfiguracije...\n`);
      for (const address of config.tokenAddresses) {
        await this.tracker.addToken(address);
        await this.sleep(1000); // Pauza između poziva
      }
    } else {
      console.log('💡 Nema podešenih tokena u .env fajlu.');
      console.log('💡 Koristite komandu "add <adresa>" da dodate token za praćenje.\n');
    }

    // Pokreni automatsko praćenje ako ima tokena
    if (config.tokenAddresses.length > 0) {
      this.startAutoTracking(config.checkInterval, config.priceChangeAlertThreshold);
    }

    // Pokreni interaktivni mod
    this.startInteractiveMode();
  }

  /**
   * Pokreni automatsko praćenje
   */
  private startAutoTracking(interval: number, threshold: number): void {
    if (this.isRunning) {
      console.log('⚠️  Automatsko praćenje je već pokrenuto.');
      return;
    }

    console.log(`✅ Automatsko praćenje pokrenuto (interval: ${interval / 1000}s, prag: ${threshold}%)\n`);

    this.isRunning = true;
    this.intervalId = setInterval(async () => {
      try {
        const alerts = await this.tracker.updateAllTokens(threshold);

        if (alerts.length > 0) {
          this.alertService.displayAlerts(alerts);
        } else {
          const timestamp = new Date().toLocaleTimeString('sr-RS');
          console.log(`✓ Ažurirano u ${timestamp} - Nema značajnih promena`);
        }
      } catch (error) {
        console.error('❌ Greška pri ažuriranju tokena:', error);
      }
    }, interval);
  }

  /**
   * Zaustavi automatsko praćenje
   */
  private stopAutoTracking(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.isRunning = false;
      console.log('⏸️  Automatsko praćenje zaustavljeno.');
    }
  }

  /**
   * Interaktivni mod
   */
  private startInteractiveMode(): void {
    this.displayHelp();

    this.rl.on('line', async (input: string) => {
      const [command, ...args] = input.trim().split(' ');

      await this.handleCommand(command.toLowerCase(), args);

      // Prikaži prompt ponovo
      this.rl.prompt();
    });

    this.rl.setPrompt('memecoin-bot> ');
    this.rl.prompt();
  }

  /**
   * Obrada komandi
   */
  private async handleCommand(command: string, args: string[]): Promise<void> {
    switch (command) {
      case 'add':
        if (args.length === 0) {
          console.log('❌ Upotreba: add <token_address>');
          break;
        }
        await this.tracker.addToken(args[0]);
        break;

      case 'remove':
        if (args.length === 0) {
          console.log('❌ Upotreba: remove <token_address>');
          break;
        }
        this.tracker.removeToken(args[0]);
        break;

      case 'list':
        this.tracker.displayTrackedTokens();
        break;

      case 'history':
        if (args.length === 0) {
          console.log('❌ Upotreba: history <token_address> [limit]');
          break;
        }
        const limit = args.length > 1 ? parseInt(args[1], 10) : 10;
        this.tracker.displayPriceHistory(args[0], limit);
        break;

      case 'stats':
        if (args.length === 0) {
          console.log('❌ Upotreba: stats <token_address>');
          break;
        }
        const stats = this.tracker.getTokenStats(args[0]);
        if (stats) {
          console.log(stats);
        } else {
          console.log('❌ Nema dovoljno podataka za statistiku.');
        }
        break;

      case 'search':
        if (args.length === 0) {
          console.log('❌ Upotreba: search <naziv_ili_simbol>');
          break;
        }
        const query = args.join(' ');
        console.log(`🔍 Pretraga za: "${query}"...\n`);
        const results = await this.dexService.searchTokens(query);
        if (results.length === 0) {
          console.log('❌ Nema rezultata.');
        } else {
          console.log(`✅ Pronađeno ${results.length} rezultata:\n`);
          results.slice(0, 10).forEach((pair, index) => {
            console.log(`${index + 1}. ${pair.baseToken.name} (${pair.baseToken.symbol})`);
            console.log(`   Adresa: ${pair.baseToken.address}`);
            console.log(`   Cena: $${pair.priceUsd}`);
            console.log(`   DEX: ${pair.dexId} (${pair.chainId})`);
            console.log('');
          });
        }
        break;

      case 'start':
        const config = loadConfig();
        this.startAutoTracking(config.checkInterval, config.priceChangeAlertThreshold);
        break;

      case 'stop':
        this.stopAutoTracking();
        break;

      case 'clear':
        console.clear();
        this.displayBanner();
        break;

      case 'help':
        this.displayHelp();
        break;

      case 'exit':
      case 'quit':
        console.log('\n👋 Doviđenja!');
        this.stopAutoTracking();
        process.exit(0);
        break;

      case '':
        // Prazan unos, ne radi ništa
        break;

      default:
        console.log(`❌ Nepoznata komanda: "${command}". Kucajte "help" za pomoć.`);
    }
  }

  /**
   * Prikaži banner
   */
  private displayBanner(): void {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 MEMECOIN BOT - DEX SCREENER TRACKER 🚀              ║
║                                                           ║
║   📊 Praćenje cena u realnom vremenu                     ║
║   💰 Automatski alerti                                    ║
║   📈 Analiza tržišta                                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
  }

  /**
   * Prikaži pomoć
   */
  private displayHelp(): void {
    console.log(`
📖 DOSTUPNE KOMANDE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  add <address>        - Dodaj token za praćenje
  remove <address>     - Ukloni token iz praćenja
  list                 - Prikaži sve praćene tokene
  history <address>    - Prikaži istoriju cena
  stats <address>      - Prikaži statistiku za token
  search <query>       - Pretraži tokene po nazivu/simbolu
  start                - Pokreni automatsko praćenje
  stop                 - Zaustavi automatsko praćenje
  clear                - Obriši ekran
  help                 - Prikaži ovu pomoć
  exit / quit          - Izađi iz bota
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 SAVETI:
  • Konfigurišite tokene u .env fajlu za automatsko učitavanje
  • Preporučeni interval provere je 60000ms (1 minut)
  • Bot automatski prikazuje alerte pri značajnim promenama cena
    `);
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Pokreni bota
const bot = new MemecoinBot();
bot.start().catch(error => {
  console.error('❌ Greška pri pokretanju bota:', error);
  process.exit(1);
});
