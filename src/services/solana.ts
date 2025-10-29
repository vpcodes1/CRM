import axios, { AxiosInstance } from 'axios';
import { DexPair } from '../types';

/**
 * Solana Token Service
 * Koristi više izvora za pronalaženje Solana tokena
 */
export class SolanaService {
  private api: AxiosInstance;
  private dexScreenerApi: AxiosInstance;

  constructor() {
    this.api = axios.create({
      timeout: 15000,
    });

    this.dexScreenerApi = axios.create({
      baseURL: 'https://api.dexscreener.com',
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });
  }

  /**
   * Preuzmi najnovije tokene na Solana chain-u
   * Koristi DEX Screener "trending" kao proxy za nove tokene
   */
  async getNewestTokens(maxAgeHours: number = 24): Promise<DexPair[]> {
    try {
      // DEX Screener ima endpoint za popularne tokene
      // Filtriramo po starosti nakon što ih dobijemo
      const response = await this.dexScreenerApi.get('/latest/dex/search', {
        params: {
          q: 'SOL', // Search za Solana parove
        },
      });

      if (!response.data || !response.data.pairs) {
        return [];
      }

      const pairs: DexPair[] = response.data.pairs;

      // Filtriraj samo Solana chain
      const solanaPairs = pairs.filter(pair => pair.chainId === 'solana');

      // Filtriraj po starosti
      const now = Date.now();
      const maxAgeMs = maxAgeHours * 60 * 60 * 1000;

      const newPairs = solanaPairs.filter(pair => {
        if (!pair.pairCreatedAt) return false;
        const age = now - pair.pairCreatedAt;
        return age <= maxAgeMs;
      });

      // Sortiraj po vremenu kreiranja (najnoviji prvi)
      return newPairs.sort((a, b) => (b.pairCreatedAt || 0) - (a.pairCreatedAt || 0));
    } catch (error: any) {
      console.error('❌ Greška pri preuzimanju novih Solana tokena:', error.message);
      return [];
    }
  }

  /**
   * Preuzmi trending Solana tokene (po volumenu)
   */
  async getTrendingTokens(limit: number = 20): Promise<DexPair[]> {
    try {
      // Pretraga popularnih Solana memecoins
      const searchTerms = ['sol', 'bonk', 'wif', 'pepe', 'doge'];
      const allPairs: DexPair[] = [];
      const seenAddresses = new Set<string>();

      for (const term of searchTerms) {
        try {
          const response = await this.dexScreenerApi.get('/latest/dex/search', {
            params: { q: term },
          });

          if (response.data && response.data.pairs) {
            const pairs = response.data.pairs
              .filter((p: DexPair) => p.chainId === 'solana')
              .filter((p: DexPair) => !seenAddresses.has(p.baseToken.address));

            pairs.forEach((p: DexPair) => {
              seenAddresses.add(p.baseToken.address);
              allPairs.push(p);
            });
          }

          // Pauza između poziva
          await this.sleep(500);
        } catch (err) {
          console.error(`Greška pri pretrazi "${term}":`, err);
        }
      }

      // Sortiraj po volumenu
      const sorted = allPairs.sort((a, b) => {
        const volA = a.volume?.h24 || 0;
        const volB = b.volume?.h24 || 0;
        return volB - volA;
      });

      return sorted.slice(0, limit);
    } catch (error: any) {
      console.error('❌ Greška pri preuzimanju trending tokena:', error.message);
      return [];
    }
  }

  /**
   * Preuzmi top gainers na Solana
   */
  async getTopGainers(limit: number = 20): Promise<DexPair[]> {
    try {
      const trending = await this.getTrendingTokens(50);

      // Filtriraj samo pozitivne promene
      const gainers = trending.filter(pair => {
        return pair.priceChange?.h24 && pair.priceChange.h24 > 0;
      });

      // Sortiraj po % promeni
      const sorted = gainers.sort((a, b) => {
        const changeA = a.priceChange?.h24 || 0;
        const changeB = b.priceChange?.h24 || 0;
        return changeB - changeA;
      });

      return sorted.slice(0, limit);
    } catch (error: any) {
      console.error('❌ Greška pri preuzimanju gainers-a:', error.message);
      return [];
    }
  }

  /**
   * Preuzmi sve Solana tokene sa filterima
   */
  async getSolanaTokens(filters: {
    minLiquidity?: number;
    minVolume24h?: number;
    maxAgeHours?: number;
  } = {}): Promise<DexPair[]> {
    try {
      let tokens: DexPair[] = [];

      // Ako ima maxAge filter, uzmi najnovije
      if (filters.maxAgeHours) {
        tokens = await this.getNewestTokens(filters.maxAgeHours);
      } else {
        tokens = await this.getTrendingTokens(50);
      }

      // Primeni filtere
      if (filters.minLiquidity) {
        tokens = tokens.filter(t => t.liquidity?.usd && t.liquidity.usd >= filters.minLiquidity!);
      }

      if (filters.minVolume24h) {
        tokens = tokens.filter(t => t.volume?.h24 && t.volume.h24 >= filters.minVolume24h!);
      }

      return tokens;
    } catch (error: any) {
      console.error('❌ Greška pri preuzimanju Solana tokena:', error.message);
      return [];
    }
  }

  /**
   * Formatuj token podatke
   */
  formatTokens(pairs: DexPair[], title: string): string {
    if (pairs.length === 0) {
      return '\n❌ Nema pronađenih Solana tokena.\n';
    }

    let output = `\n${'═'.repeat(70)}\n`;
    output += `  ${title}\n`;
    output += `${'═'.repeat(70)}\n\n`;

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
      output += `   🔗 DEX: ${pair.dexId}\n`;
      output += `   ⏰ Starost: ${age}\n`;
      output += `   📍 Adresa: ${pair.baseToken.address}\n`;
      output += `\n`;
    });

    output += `${'═'.repeat(70)}\n`;
    output += `💡 Da dodate token: add <adresa>\n`;
    output += `${'═'.repeat(70)}\n`;

    return output;
  }

  /**
   * Dobij starost tokena
   */
  private getTokenAge(timestamp?: number): string {
    if (!timestamp) return 'Nepoznato';

    const now = Date.now();
    const ageMs = now - timestamp;
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
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
