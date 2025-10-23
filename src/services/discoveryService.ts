import { DexScreenerService } from './dexscreener';
import { DexPair } from '../types';

/**
 * Konfigurisljivi filteri za pronalaženje tokena
 */
export interface DiscoveryFilters {
  minLiquidity?: number;      // Minimum likvidnost u USD
  minVolume24h?: number;       // Minimum 24h volumen u USD
  maxAgeHours?: number;        // Maximum starost para u satima (za nove tokene)
  minPriceChange?: number;     // Minimum promena cene (za gainers)
  maxPriceChange?: number;     // Maximum promena cene (za losers)
  chains?: string[];           // Filteri po chain-u (solana, ethereum, bsc, itd)
}

/**
 * Servis za automatsko pronalaženje novih i trending tokena
 */
export class DiscoveryService {
  private dexService: DexScreenerService;

  // Default filteri za sigurnost (izbegavanje scam tokena)
  private defaultSafetyFilters: DiscoveryFilters = {
    minLiquidity: 5000,    // Minimum $5k likvidnost
    minVolume24h: 1000,    // Minimum $1k volume
  };

  // Popularne meme coin kategorije i termini za pretragu
  private memeSearchTerms = [
    // Popularne kategorije
    'doge', 'shib', 'pepe', 'wojak', 'chad', 'apu', 'meme',
    // Solana memecoins
    'bonk', 'wif', 'popcat', 'mew', 'mother', 'tremp', 'boden',
    // Ethereum memecoins
    'floki', 'elon', 'shiba', 'dogecoin', 'kishu',
    // Novi trendovi
    'cat', 'dog', 'frog', 'based', 'moon', 'inu'
  ];

  constructor() {
    this.dexService = new DexScreenerService();
  }

  /**
   * Multi-search - pretražuje više termina i kombinuje rezultate
   */
  private async multiSearch(
    searchTerms: string[],
    maxResults: number = 100
  ): Promise<DexPair[]> {
    const allPairs: DexPair[] = [];
    const seenAddresses = new Set<string>();

    // Pretraga svakog termina
    for (const term of searchTerms.slice(0, 10)) { // Ograniči na 10 termina da ne pređemo rate limit
      try {
        const pairs = await this.dexService.searchTokens(term);

        // Dodaj samo unique parove
        for (const pair of pairs) {
          const key = `${pair.chainId}-${pair.baseToken.address}`;
          if (!seenAddresses.has(key)) {
            seenAddresses.add(key);
            allPairs.push(pair);
          }
        }

        // Mala pauza između pretraga
        await this.sleep(300);

        if (allPairs.length >= maxResults) {
          break;
        }
      } catch (error) {
        console.error(`Greška pri pretrazi termina "${term}":`, error);
      }
    }

    return allPairs;
  }

  /**
   * Pronađi trending tokene (po volumenu)
   */
  async findTrending(
    searchQuery: string = 'auto',
    limit: number = 10,
    filters: DiscoveryFilters = {}
  ): Promise<DexPair[]> {
    console.log(`🔍 Tražim trending meme tokene...`);

    let pairs: DexPair[] = [];

    // Ako je "auto", koristi multi-search sa meme terminima
    if (searchQuery === 'auto' || searchQuery === 'meme' || searchQuery === 'solana' || searchQuery === 'ethereum') {
      pairs = await this.multiSearch(this.memeSearchTerms, 100);
    } else {
      // Ako korisnik unese konkretan termin, traži samo to
      pairs = await this.dexService.searchTokens(searchQuery);
    }

    if (pairs.length === 0) {
      console.log('❌ Nema pronađenih tokena.');
      return [];
    }

    // Primeni filtere
    const filtered = this.applyFilters(pairs, { ...this.defaultSafetyFilters, ...filters });

    // Sortiraj po volumenu (descending)
    const sorted = filtered.sort((a, b) => {
      const volA = a.volume?.h24 || 0;
      const volB = b.volume?.h24 || 0;
      return volB - volA;
    });

    return sorted.slice(0, limit);
  }

  /**
   * Pronađi nove tokene (sveže listinzi)
   */
  async findNew(
    searchQuery: string = 'auto',
    maxAgeHours: number = 24,
    limit: number = 10,
    filters: DiscoveryFilters = {}
  ): Promise<DexPair[]> {
    console.log(`🆕 Tražim nove meme tokene (mlađe od ${maxAgeHours}h)...`);

    let pairs: DexPair[] = [];

    // Ako je "auto", koristi multi-search
    if (searchQuery === 'auto' || searchQuery === 'meme' || searchQuery === 'solana' || searchQuery === 'ethereum') {
      pairs = await this.multiSearch(this.memeSearchTerms, 100);
    } else {
      pairs = await this.dexService.searchTokens(searchQuery);
    }

    if (pairs.length === 0) {
      return [];
    }

    const now = Date.now();
    const maxAgeMs = maxAgeHours * 60 * 60 * 1000;

    // Filtriraj po starosti
    const newPairs = pairs.filter(pair => {
      if (!pair.pairCreatedAt) return false;
      const age = now - pair.pairCreatedAt;
      return age <= maxAgeMs;
    });

    // Primeni dodatne filtere
    const filtered = this.applyFilters(newPairs, { ...this.defaultSafetyFilters, ...filters });

    // Sortiraj po vremenu kreiranja (najnoviji prvi)
    const sorted = filtered.sort((a, b) => {
      return (b.pairCreatedAt || 0) - (a.pairCreatedAt || 0);
    });

    return sorted.slice(0, limit);
  }

  /**
   * Pronađi top gainers (najveći rast)
   */
  async findGainers(
    searchQuery: string = 'auto',
    limit: number = 10,
    filters: DiscoveryFilters = {}
  ): Promise<DexPair[]> {
    console.log(`🚀 Tražim top meme gainers...`);

    let pairs: DexPair[] = [];

    // Ako je "auto", koristi multi-search
    if (searchQuery === 'auto' || searchQuery === 'meme' || searchQuery === 'solana' || searchQuery === 'ethereum') {
      pairs = await this.multiSearch(this.memeSearchTerms, 100);
    } else {
      pairs = await this.dexService.searchTokens(searchQuery);
    }

    if (pairs.length === 0) {
      return [];
    }

    // Filtriraj samo pozitivne promene
    const gainers = pairs.filter(pair => {
      return pair.priceChange?.h24 && pair.priceChange.h24 > 0;
    });

    // Primeni filtere
    const filtered = this.applyFilters(gainers, { ...this.defaultSafetyFilters, ...filters });

    // Sortiraj po procentualnoj promeni (descending)
    const sorted = filtered.sort((a, b) => {
      const changeA = a.priceChange?.h24 || 0;
      const changeB = b.priceChange?.h24 || 0;
      return changeB - changeA;
    });

    return sorted.slice(0, limit);
  }

  /**
   * Pronađi top losers (najveći pad)
   */
  async findLosers(
    searchQuery: string = 'auto',
    limit: number = 10,
    filters: DiscoveryFilters = {}
  ): Promise<DexPair[]> {
    console.log(`📉 Tražim top meme losers...`);

    let pairs: DexPair[] = [];

    // Ako je "auto", koristi multi-search
    if (searchQuery === 'auto' || searchQuery === 'meme' || searchQuery === 'solana' || searchQuery === 'ethereum') {
      pairs = await this.multiSearch(this.memeSearchTerms, 100);
    } else {
      pairs = await this.dexService.searchTokens(searchQuery);
    }

    if (pairs.length === 0) {
      return [];
    }

    // Filtriraj samo negativne promene
    const losers = pairs.filter(pair => {
      return pair.priceChange?.h24 && pair.priceChange.h24 < 0;
    });

    // Primeni filtere
    const filtered = this.applyFilters(losers, { ...this.defaultSafetyFilters, ...filters });

    // Sortiraj po procentualnoj promeni (ascending)
    const sorted = filtered.sort((a, b) => {
      const changeA = a.priceChange?.h24 || 0;
      const changeB = b.priceChange?.h24 || 0;
      return changeA - changeB;
    });

    return sorted.slice(0, limit);
  }

  /**
   * Primeni filtere na parove
   */
  private applyFilters(pairs: DexPair[], filters: DiscoveryFilters): DexPair[] {
    let filtered = [...pairs];

    // Filter po likvidnosti
    if (filters.minLiquidity) {
      filtered = filtered.filter(pair => {
        return pair.liquidity?.usd && pair.liquidity.usd >= filters.minLiquidity!;
      });
    }

    // Filter po volumenu
    if (filters.minVolume24h) {
      filtered = filtered.filter(pair => {
        return pair.volume?.h24 && pair.volume.h24 >= filters.minVolume24h!;
      });
    }

    // Filter po chain-u
    if (filters.chains && filters.chains.length > 0) {
      filtered = filtered.filter(pair => {
        return filters.chains!.includes(pair.chainId.toLowerCase());
      });
    }

    return filtered;
  }

  /**
   * Formatuj rezultate discovery-ja za prikaz
   */
  formatDiscoveryResults(pairs: DexPair[], title: string): string {
    if (pairs.length === 0) {
      return '\n❌ Nema pronađenih tokena koji ispunjavaju kriterijume.\n';
    }

    let output = `\n${'═'.repeat(60)}\n`;
    output += `  ${title}\n`;
    output += `${'═'.repeat(60)}\n\n`;

    pairs.forEach((pair, index) => {
      const priceChange = pair.priceChange?.h24 || 0;
      const emoji = priceChange >= 0 ? '🟢' : '🔴';
      const sign = priceChange >= 0 ? '+' : '';

      const age = this.getTokenAge(pair.pairCreatedAt);
      const volume = this.formatNumber(pair.volume?.h24 || 0);
      const liquidity = this.formatNumber(pair.liquidity?.usd || 0);

      output += `${index + 1}. ${emoji} ${pair.baseToken.name} (${pair.baseToken.symbol})\n`;
      output += `   💵 Cena: $${pair.priceUsd}\n`;
      output += `   📊 24h: ${sign}${priceChange.toFixed(2)}%\n`;
      output += `   📈 Volume: $${volume}\n`;
      output += `   💧 Likvidnost: $${liquidity}\n`;
      output += `   🔗 Chain: ${pair.chainId} | DEX: ${pair.dexId}\n`;
      output += `   ⏰ Starost: ${age}\n`;
      output += `   📍 Adresa: ${pair.baseToken.address}\n`;
      output += `\n`;
    });

    output += `${'═'.repeat(60)}\n`;
    output += `💡 Da dodate token: add <adresa>\n`;
    output += `${'═'.repeat(60)}\n`;

    return output;
  }

  /**
   * Dobij starost tokena u čitljivom formatu
   */
  private getTokenAge(pairCreatedAt?: number): string {
    if (!pairCreatedAt) return 'Nepoznato';

    const now = Date.now();
    const ageMs = now - pairCreatedAt;
    const ageHours = ageMs / (1000 * 60 * 60);
    const ageDays = ageHours / 24;

    if (ageDays >= 1) {
      return `${Math.floor(ageDays)} dana`;
    } else if (ageHours >= 1) {
      return `${Math.floor(ageHours)} sati`;
    } else {
      const ageMinutes = ageMs / (1000 * 60);
      return `${Math.floor(ageMinutes)} minuta`;
    }
  }

  /**
   * Formatiraj brojeve
   */
  private formatNumber(num: number): string {
    if (num >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(2) + 'B';
    }
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(2) + 'M';
    }
    if (num >= 1_000) {
      return (num / 1_000).toFixed(2) + 'K';
    }
    return num.toFixed(2);
  }

  /**
   * Dobij preporuke za sigurno trgovanje
   */
  getSafetyTips(pair: DexPair): string[] {
    const tips: string[] = [];
    const liquidity = pair.liquidity?.usd || 0;
    const volume = pair.volume?.h24 || 0;
    const age = pair.pairCreatedAt ? Date.now() - pair.pairCreatedAt : 0;
    const ageHours = age / (1000 * 60 * 60);

    // Provere za sigurnost
    if (liquidity < 10000) {
      tips.push('⚠️  Niska likvidnost - rizik od rug pull-a!');
    }

    if (volume < 5000) {
      tips.push('⚠️  Nizak volumen - teško je prodati token');
    }

    if (ageHours < 1) {
      tips.push('🆕 Veoma nov token - budite oprezni!');
    }

    if (pair.priceChange?.h24 && Math.abs(pair.priceChange.h24) > 100) {
      tips.push('⚠️  Ekstremna volatilnost!');
    }

    if (tips.length === 0) {
      tips.push('✅ Token izgleda relativno bezbedno');
    }

    return tips;
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
