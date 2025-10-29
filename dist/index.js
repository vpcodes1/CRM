#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const readline = __importStar(require("readline"));
const priceTracker_1 = require("./services/priceTracker");
const alertService_1 = require("./services/alertService");
const dexscreener_1 = require("./services/dexscreener");
const discoveryService_1 = require("./services/discoveryService");
const pumpfun_1 = require("./services/pumpfun");
const solana_1 = require("./services/solana");
const jupiter_1 = require("./services/jupiter");
const config_1 = require("./config");
/**
 * Glavni bot za praćenje meme coina
 */
class MemecoinBot {
    constructor() {
        this.isRunning = false;
        this.isDiscoveryRunning = false;
        this.tracker = new priceTracker_1.PriceTrackerService();
        this.alertService = new alertService_1.AlertService();
        this.dexService = new dexscreener_1.DexScreenerService();
        this.discoveryService = new discoveryService_1.DiscoveryService();
        this.pumpFunService = new pumpfun_1.PumpFunService();
        this.solanaService = new solana_1.SolanaService();
        this.jupiterService = new jupiter_1.JupiterService();
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
    }
    /**
     * Pokreni bota
     */
    async start() {
        console.clear();
        this.displayBanner();
        const config = (0, config_1.loadConfig)();
        if (!(0, config_1.validateConfig)(config)) {
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
        }
        else {
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
    startAutoTracking(interval, threshold) {
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
                }
                else {
                    const timestamp = new Date().toLocaleTimeString('sr-RS');
                    console.log(`✓ Ažurirano u ${timestamp} - Nema značajnih promena`);
                }
            }
            catch (error) {
                console.error('❌ Greška pri ažuriranju tokena:', error);
            }
        }, interval);
    }
    /**
     * Zaustavi automatsko praćenje
     */
    stopAutoTracking() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.isRunning = false;
            console.log('⏸️  Automatsko praćenje zaustavljeno.');
        }
    }
    /**
     * Pokreni auto-discovery mod
     */
    startAutoDiscovery(config) {
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
                const newTokens = await this.discoveryService.findNew('auto', config.maxTokenAgeHours, 5, filters);
                if (newTokens.length > 0) {
                    const output = this.discoveryService.formatDiscoveryResults(newTokens, '🆕 NOVI MEME TOKENI');
                    console.log(output);
                }
                // Pronađi top gainers - koristi 'auto' za multi-search
                const gainers = await this.discoveryService.findGainers('auto', 5, filters);
                if (gainers.length > 0) {
                    const output = this.discoveryService.formatDiscoveryResults(gainers, '🚀 TOP MEME GAINERS');
                    console.log(output);
                }
                this.rl.prompt();
            }
            catch (error) {
                console.error('❌ Greška pri auto-discovery-u:', error);
            }
        }, config.discoveryInterval);
    }
    /**
     * Zaustavi auto-discovery
     */
    stopAutoDiscovery() {
        if (this.discoveryIntervalId) {
            clearInterval(this.discoveryIntervalId);
            this.isDiscoveryRunning = false;
            console.log('⏸️  Auto-discovery zaustavljen.');
        }
    }
    /**
     * Interaktivni mod
     */
    startInteractiveMode() {
        this.displayHelp();
        this.rl.on('line', async (input) => {
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
    async handleCommand(command, args) {
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
                }
                else {
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
                }
                else {
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
                    const config = (0, config_1.loadConfig)();
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
                    const config = (0, config_1.loadConfig)();
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
                    const config = (0, config_1.loadConfig)();
                    // Niži filteri za veoma nove tokene
                    const filters = {
                        minLiquidity: 2000, // $2k minimum za nove tokene
                        minVolume24h: 500, // $500 minimum volume
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
                    const config = (0, config_1.loadConfig)();
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
                    const config = (0, config_1.loadConfig)();
                    const filters = {
                        minLiquidity: config.minLiquidity,
                        minVolume24h: config.minVolume24h,
                    };
                    const losers = await this.discoveryService.findLosers(searchQuery, 10, filters);
                    const output = this.discoveryService.formatDiscoveryResults(losers, '📉 TOP MEME LOSERS');
                    console.log(output);
                }
                break;
            case 'sol-new':
            case 'solana-new':
                {
                    console.log('🌟 Tražim najnovije Solana tokene...\n');
                    const maxAge = args.length > 0 ? parseInt(args[0], 10) : 24;
                    const tokens = await this.solanaService.getNewestTokens(maxAge);
                    const output = this.solanaService.formatTokens(tokens, `🌟 NAJNOVIJI SOLANA TOKENI (< ${maxAge}h)`);
                    console.log(output);
                    if (maxAge <= 1 && tokens.length > 0) {
                        console.log('⚠️  UPOZORENJE: Veoma novi tokeni - EKSTREMNO RIZIČNI!');
                        console.log('⚠️  Mogu biti pump & dump ili rug pull. Budite VEOMA oprezni!\n');
                    }
                }
                break;
            case 'sol-trending':
            case 'solana-trending':
                {
                    console.log('🔥 Tražim trending Solana tokene...\n');
                    const limit = args.length > 0 ? parseInt(args[0], 10) : 20;
                    const tokens = await this.solanaService.getTrendingTokens(limit);
                    const output = this.solanaService.formatTokens(tokens, '🔥 TRENDING SOLANA TOKENI');
                    console.log(output);
                }
                break;
            case 'sol-gainers':
            case 'solana-gainers':
                {
                    console.log('🚀 Tražim top Solana gainers...\n');
                    const limit = args.length > 0 ? parseInt(args[0], 10) : 20;
                    const tokens = await this.solanaService.getTopGainers(limit);
                    const output = this.solanaService.formatTokens(tokens, '🚀 TOP SOLANA GAINERS (24h)');
                    console.log(output);
                }
                break;
            case 'jup-all':
            case 'jupiter-all':
                {
                    console.log('🪐 Preuzimam SVE Solana tokene sa Jupiter-a...\n');
                    const forceRefresh = args.includes('--refresh') || args.includes('-r');
                    const tokens = await this.jupiterService.getAllTokens(forceRefresh);
                    console.log(`\n✅ Jupiter Token List\n${'═'.repeat(60)}\n`);
                    console.log(`📊 Ukupno tokena: ${tokens.length}`);
                    console.log(`⏰ Cache: ${forceRefresh ? 'Osveženo' : '5 minuta'}`);
                    console.log(`\n💡 Koristite 'jup-search <naziv>' za pretragu`);
                    console.log(`💡 Koristite 'jup-recent' za nove tokene\n`);
                }
                break;
            case 'jup-search':
            case 'jupiter-search':
                {
                    if (args.length === 0) {
                        console.log('❌ Upotreba: jup-search <naziv_ili_simbol>');
                        break;
                    }
                    const query = args.join(' ');
                    console.log(`🪐 Pretraga Jupiter tokena: "${query}"...\n`);
                    const limit = 20;
                    const tokens = await this.jupiterService.searchTokens(query, limit);
                    const output = this.jupiterService.formatTokens(tokens, `🔍 JUPITER - Rezultati za "${query}"`);
                    console.log(output);
                }
                break;
            case 'jup-recent':
            case 'jupiter-recent':
                {
                    console.log('🪐 Tražim nedavne Solana tokene na Jupiter-u...\n');
                    const limit = args.length > 0 ? parseInt(args[0], 10) : 30;
                    const tokens = await this.jupiterService.getRecentTokens(limit);
                    const output = this.jupiterService.formatTokens(tokens, '🆕 JUPITER - NEDAVNI TOKENI');
                    console.log(output);
                    console.log('💡 TIP: Ovi tokeni su heuristički odabrani (bez CoinGecko ID-a)');
                    console.log('💡 Nisu garantovano najnoviji, ali verovatno noviji od popularnih\n');
                }
                break;
            case 'jup-popular':
            case 'jupiter-popular':
                {
                    console.log('🪐 Tražim popularne Solana tokene na Jupiter-u...\n');
                    const limit = args.length > 0 ? parseInt(args[0], 10) : 20;
                    const tokens = await this.jupiterService.getPopularTokens(limit);
                    const output = this.jupiterService.formatTokens(tokens, '⭐ JUPITER - POPULARNI TOKENI');
                    console.log(output);
                }
                break;
            case 'jup-clear':
            case 'jupiter-clear':
                {
                    this.jupiterService.clearCache();
                    console.log('✅ Jupiter cache očišćen\n');
                }
                break;
            case 'pump':
            case 'pumpfun':
                {
                    console.log('🚀 Preuzimam najnovije tokene sa Pump.fun...\n');
                    const limit = args.length > 0 ? parseInt(args[0], 10) : 15;
                    const tokens = await this.pumpFunService.getNewestTokens(limit);
                    const output = this.pumpFunService.formatTokenList(tokens, '🚀 PUMP.FUN - NAJNOVIJI TOKENI');
                    console.log(output);
                }
                break;
            case 'pump-trending':
                {
                    console.log('🔥 Preuzimam trending tokene sa Pump.fun...\n');
                    const limit = args.length > 0 ? parseInt(args[0], 10) : 15;
                    const tokens = await this.pumpFunService.getTrendingTokens(limit);
                    const output = this.pumpFunService.formatTokenList(tokens, '🔥 PUMP.FUN - TRENDING');
                    console.log(output);
                }
                break;
            case 'pump-new':
                {
                    console.log('⚡ Preuzimam ultra-nove tokene sa Pump.fun...\n');
                    const hours = args.length > 0 ? parseInt(args[0], 10) : 1;
                    const allTokens = await this.pumpFunService.getNewestTokens(50);
                    const filtered = this.pumpFunService.filterByAge(allTokens, hours);
                    const output = this.pumpFunService.formatTokenList(filtered, `⚡ PUMP.FUN - NOVI (< ${hours}h)`);
                    console.log(output);
                    if (filtered.length > 0) {
                        console.log('💡 TIP: Pump.fun tokeni su na Solana chain-u');
                        console.log('💡 Možete ih dodati: add <mint_adresa>\n');
                    }
                }
                break;
            case 'discovery-start':
                {
                    const config = (0, config_1.loadConfig)();
                    this.startAutoDiscovery(config);
                }
                break;
            case 'discovery-stop':
                this.stopAutoDiscovery();
                break;
            case 'start':
                const config = (0, config_1.loadConfig)();
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
    displayBanner() {
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
    displayHelp() {
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

☀️ SOLANA TOKENI (DEX Screener):
  sol-new [hours]        - 🌟 Najnoviji Solana tokeni (default: 24h)
  sol-trending [limit]   - 🔥 Trending Solana tokeni po volumenu
  sol-gainers [limit]    - 🚀 Top Solana gainers (24h rast)

🪐 JUPITER (Solana Token Aggregator):
  jup-all [--refresh]    - 📊 Preuzmi SVE Solana tokene (sa cache-om)
  jup-search <query>     - 🔍 Pretraži tokene po nazivu/simbolu
  jup-recent [limit]     - 🆕 Nedavni/novi tokeni (heuristika)
  jup-popular [limit]    - ⭐ Popularni verified tokeni
  jup-clear              - 🗑️  Očisti cache

🚀 PUMP.FUN (Solana Launchpad):
  pump [limit]           - Najnoviji tokeni sa Pump.fun
  pump-trending [limit]  - Trending tokeni sa Pump.fun
  pump-new [hours]       - Ultra-novi Pump.fun tokeni (< Nh)

🤖 AUTO-DISCOVERY:
  discovery-start        - Bot automatski prikazuje nove memecoins!
  discovery-stop         - Zaustavi auto-discovery

⚙️  OSTALO:
  clear                  - Obriši ekran
  help                   - Prikaži ovu pomoć
  exit / quit            - Izađi iz bota
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 KAKO RADI:
  • Bot koristi TRI izvora: DEX Screener + Jupiter + Pump.fun
  • DEX Screener = svi chain-ovi (Solana, Ethereum, BSC...)
  • Jupiter = kompletna lista SVIH Solana tokena (PREPORUČENO!)
  • Pump.fun = Solana launchpad sa najnovijim tokenima
  • Automatski filtrira scam tokene (min. likvidnost, volumen)

📝 PRIMERI:
  jup-all               - 🪐 Preuzmi sve Solana tokene (Jupiter)
  jup-search pepe       - 🪐 Traži token na Jupiter-u
  jup-recent 50         - 🪐 Nedavni tokeni (heuristika)
  sol-new 1             - ☀️ Najnoviji Solana tokeni (< 1h)
  sol-trending          - ☀️ Trending Solana tokeni
  sol-gainers           - ☀️ Top Solana gainers
  trending              - Prikaži trending memecoins (DEX Screener)
  pump                  - Najnoviji tokeni sa Pump.fun (Solana)
  pump-new 1            - Ultra-novi Pump.fun tokeni (< 1h)
  newest                - ⚡ Tek izašli tokeni (< 1h) - RISKY!
  gainers               - Koji memecoins najviše rastu
  discovery-start       - Pusti bota da radi za tebe!
    `);
    }
    /**
     * Sleep helper
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
// Pokreni bota
const bot = new MemecoinBot();
bot.start().catch(error => {
    console.error('❌ Greška pri pokretanju bota:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map