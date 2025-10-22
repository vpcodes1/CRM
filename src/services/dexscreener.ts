import axios, { AxiosInstance } from 'axios';
import { DexPair, TokenData } from '../types';

/**
 * DEX Screener API servis
 * https://docs.dexscreener.com/api/reference
 */
export class DexScreenerService {
  private api: AxiosInstance;
  private baseUrl = 'https://api.dexscreener.com/latest';

  constructor() {
    this.api = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Preuzmi podatke o tokenu po adresi
   */
  async getTokenByAddress(tokenAddress: string): Promise<TokenData | null> {
    try {
      const response = await this.api.get(`/dex/tokens/${tokenAddress}`);

      if (!response.data || !response.data.pairs || response.data.pairs.length === 0) {
        console.log(`❌ Token ${tokenAddress} nije pronađen na DEX Screeneru`);
        return null;
      }

      const pairs: DexPair[] = response.data.pairs;

      // Uzmi glavni par (obično prvi je sa najvećom likvidnošću)
      const mainPair = pairs[0];

      const tokenData: TokenData = {
        address: tokenAddress,
        name: mainPair.baseToken.name,
        symbol: mainPair.baseToken.symbol,
        price: parseFloat(mainPair.priceUsd || '0'),
        priceChange24h: mainPair.priceChange?.h24 || 0,
        volume24h: mainPair.volume?.h24 || 0,
        liquidity: mainPair.liquidity?.usd || 0,
        marketCap: mainPair.marketCap || mainPair.fdv || 0,
        pairs: pairs,
        lastUpdated: new Date(),
      };

      return tokenData;
    } catch (error: any) {
      if (error.response?.status === 429) {
        console.error('⚠️  Rate limit dostignut. Sačekajte malo pre sledećeg poziva.');
      } else {
        console.error(`❌ Greška pri preuzimanju podataka za token ${tokenAddress}:`, error.message);
      }
      return null;
    }
  }

  /**
   * Preuzmi podatke o paru po adresi
   */
  async getPairByAddress(pairAddress: string): Promise<DexPair | null> {
    try {
      const response = await this.api.get(`/dex/pairs/${pairAddress}`);

      if (!response.data || !response.data.pair) {
        console.log(`❌ Par ${pairAddress} nije pronađen`);
        return null;
      }

      return response.data.pair;
    } catch (error: any) {
      console.error(`❌ Greška pri preuzimanju podataka za par ${pairAddress}:`, error.message);
      return null;
    }
  }

  /**
   * Traži tokene po upitu
   */
  async searchTokens(query: string): Promise<DexPair[]> {
    try {
      const response = await this.api.get(`/dex/search?q=${encodeURIComponent(query)}`);

      if (!response.data || !response.data.pairs) {
        return [];
      }

      return response.data.pairs;
    } catch (error: any) {
      console.error(`❌ Greška pri pretraživanju tokena: ${error.message}`);
      return [];
    }
  }

  /**
   * Formatuj token podatke za prikaz
   */
  formatTokenData(token: TokenData): string {
    const priceChangeEmoji = token.priceChange24h >= 0 ? '📈' : '📉';
    const priceChangeColor = token.priceChange24h >= 0 ? '+' : '';

    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 ${token.name} (${token.symbol})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💵 Cena: $${token.price.toFixed(token.price < 0.01 ? 8 : 4)}
${priceChangeEmoji} 24h promena: ${priceChangeColor}${token.priceChange24h.toFixed(2)}%
📊 Volume 24h: $${this.formatNumber(token.volume24h)}
💧 Likvidnost: $${this.formatNumber(token.liquidity)}
🏦 Market Cap: $${this.formatNumber(token.marketCap)}
📍 Broj parova: ${token.pairs.length}
🕐 Ažurirano: ${token.lastUpdated.toLocaleTimeString('sr-RS')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();
  }

  /**
   * Formatiraj brojeve sa skraćenicama (K, M, B)
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
}
