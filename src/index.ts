#!/usr/bin/env node

import * as readline from 'readline';
import { PriceTrackerService } from './services/priceTracker';
import { AlertService } from './services/alertService';
import { DexScreenerService } from './services/dexscreener';
import { DiscoveryService } from './services/discoveryService';
import { loadConfig, validateConfig } from './config';

/**
 * Glavni bot za praćenje meme coina
 */
class MemecoinBot {
  private tracker: PriceTrackerService;
  private alertService: AlertService;
  private dexService: DexScreenerService;
  private discoveryService: DiscoveryService;
  private intervalId?: NodeJS.Timeout;
  private discoveryIntervalId?: NodeJS.Timeout;
  private isRunning: boolean = false;
  private isDiscoveryRunning: boolean = false;
  private rl: readline.Interface;

  constructor() {
    this.tracker = new PriceTrackerService();
    this.alertService = new AlertService();
    this.dexService = new DexScreenerService();
    this.discoveryService = new DiscoveryService();
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

    // Pokreni auto-discovery ako je omogućen
    if (config.autoDiscoveryEnabled) {
      console.log('🤖 Auto-discovery mod je omogućen!\n');
      this.startAutoDiscovery(config);
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
   * Pokreni auto-discovery mod
   */
  private startAutoDiscovery(config: any): void {
    if (this.isDiscoveryRunning) {
      console.log('⚠️  Auto-discovery je već pokrenut.');
      return;
    }

    console.log(`🤖 Auto-discovery pokrenut (interval: ${config.discoveryInterval / 1000}s)\n`);

    this.isDiscoveryRunning = true;
    this.discoveryIntervalId = setInterval(async () => {
      try {
        console.log('\n' + '═'.repeat(60));
        console.log('🔍 AUTO-DISCOVERY: Tražim nove tokene...');
        console.log('═'.repeat(60) + '\n');

        const filters = {
          minLiquidity: config.minLiquidity,
          minVolume24h: config.minVolume24h,
        };

        // Pronađi nove tokene - koristi 'auto' za multi-search
        const newTokens = await this.discoveryService.findNew(
          'auto',
          config.maxTokenAgeHours,
          5,
          filters
        );

        if (newTokens.length > 0) {
          const output = this.discoveryService.formatDiscoveryResults(
            newTokens,
            '🆕 NOVI MEME TOKENI'
          );
          console.log(output);
        }

        // Pronađi top gainers - koristi 'auto' za multi-search
        const gainers = await this.discoveryService.findGainers(
          'auto',
          5,
          filters
        );

        if (gainers.length > 0) {
          const output = this.discoveryService.formatDiscoveryResults(
            gainers,
            '🚀 TOP MEME GAINERS'
          );
          console.log(output);
        }

        this.rl.prompt();
      } catch (error) {
        console.error('❌ Greška pri auto-discovery-u:', error);
      }
    }, config.discoveryInterval);
  }

  /**
   * Zaustavi auto-discovery
   */
  private stopAutoDiscovery(): void {
    if (this.discoveryIntervalId) {
      clearInterval(this.discoveryIntervalId);
      this.isDiscoveryRunning = false;
      console.log('⏸️  Auto-discovery zaustavljen.');
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

      case 'trending':
        {
          const searchQuery = args.length > 0 ? args.join(' ') : 'auto';
          const config = loadConfig();
          const filters = {
            minLiquidity: config.minLiquidity,
            minVolume24h: config.minVolume24h,
          };
          const trending = await this.discoveryService.findTrending(searchQuery, 10, filters);
          const output = this.discoveryService.formatDiscoveryResults(trending, '🔥 TRENDING MEME TOKENI');
          console.log(output);
        }
        break;

      case 'new':
        {
          const searchQuery = args.length > 0 ? args[0] : 'auto';
          const maxAge = args.length > 1 ? parseInt(args[1], 10) : 24;
          const config = loadConfig();
          const filters = {
            minLiquidity: config.minLiquidity,
            minVolume24h: config.minVolume24h,
          };
          const newTokens = await this.discoveryService.findNew(searchQuery, maxAge, 10, filters);
          const output = this.discoveryService.formatDiscoveryResults(newTokens, '🆕 NOVI MEME TOKENI');
          console.log(output);
        }
        break;

      case 'newest':
      case 'ultra-new':
        {
          console.log('⚡ Tražim ULTRA-NOVE tokene (mlađe od 1h)...\n');
          const config = loadConfig();
          // Niži filteri za veoma nove tokene
          const filters = {
            minLiquidity: 2000,  // $2k minimum za nove tokene
            minVolume24h: 500,   // $500 minimum volume
          };
          const newestTokens = await this.discoveryService.findNew('auto', 1, 15, filters);
          const output = this.discoveryService.formatDiscoveryResults(newestTokens, '⚡ ULTRA-NOVI TOKENI (< 1h)');
          console.log(output);

          if (newestTokens.length > 0) {
            console.log('⚠️  UPOZORENJE: Ovi tokeni su VEOMA novi - EKSTREMNO RIZIČNI!');
            console.log('⚠️  Mogu biti pump & dump ili rug pull. Budite VEOMA oprezni!\n');
          }
        }
        break;

      case 'gainers':
        {
          const searchQuery = args.length > 0 ? args.join(' ') : 'auto';
          const config = loadConfig();
          const filters = {
            minLiquidity: config.minLiquidity,
            minVolume24h: config.minVolume24h,
          };
          const gainers = await this.discoveryService.findGainers(searchQuery, 10, filters);
          const output = this.discoveryService.formatDiscoveryResults(gainers, '🚀 TOP MEME GAINERS');
          console.log(output);
        }
        break;

      case 'losers':
        {
          const searchQuery = args.length > 0 ? args.join(' ') : 'auto';
          const config = loadConfig();
          const filters = {
            minLiquidity: config.minLiquidity,
            minVolume24h: config.minVolume24h,
          };
          const losers = await this.discoveryService.findLosers(searchQuery, 10, filters);
          const output = this.discoveryService.formatDiscoveryResults(losers, '📉 TOP MEME LOSERS');
          console.log(output);
        }
        break;

      case 'discovery-start':
        {
          const config = loadConfig();
          this.startAutoDiscovery(config);
        }
        break;

      case 'discovery-stop':
        this.stopAutoDiscovery();
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
        this.stopAutoDiscovery();
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

🎯 PRAĆENJE TOKENA:
  add <address>          - Dodaj token za praćenje
  remove <address>       - Ukloni token iz praćenja
  list                   - Prikaži sve praćene tokene
  history <address>      - Prikaži istoriju cena
  stats <address>        - Prikaži statistiku za token
  start                  - Pokreni automatsko praćenje
  stop                   - Zaustavi automatsko praćenje

🔍 PRONALAŽENJE MEME TOKENA (AUTO-SMART SEARCH):
  trending               - Trending memecoins (pepe, doge, shib, bonk, wif...)
  new [hours]            - Novi memecoins (default: 24h)
  newest                 - ⚡ ULTRA-NOVI tokeni (< 1h) - VEOMA RIZIČNO!
  gainers                - Top meme gainers (24h rast)
  losers                 - Top meme losers (24h pad)
  search <query>         - Pretraži konkretni token

🤖 AUTO-DISCOVERY:
  discovery-start        - Bot automatski prikazuje nove memecoins!
  discovery-stop         - Zaustavi auto-discovery

⚙️  OSTALO:
  clear                  - Obriši ekran
  help                   - Prikaži ovu pomoć
  exit / quit            - Izađi iz bota
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 KAKO RADI:
  • Bot automatski traži popularne meme termine (doge, pepe, shib, bonk...)
  • Ne moraš da znaš tačne nazive - bot pronalazi sve memecoins!
  • Automatski filtrira scam tokene (min. likvidnost, volumen)
  • Prikazuje tokene sa SVIH chain-ova (Solana, Ethereum, BSC...)

📝 PRIMERI:
  trending              - Prikaži trending memecoins (ALL chains)
  new 6                 - Novi memecoins mlađi od 6h
  newest                - ⚡ Tek izašli tokeni (< 1h) - risky ali profitabilno!
  gainers               - Koji memecoins najviše rastu
  discovery-start       - Pusti bota da radi za tebe!
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
