import axios, { AxiosInstance } from 'axios';
import { DexPair } from '../types';

/**
 * Jupiter Token Interface
 */
export interface JupiterToken {
  address: string;
  chainId: number;
  decimals: number;
  name: string;
  symbol: string;
  logoURI?: string;
  tags?: string[];
  extensions?: {
    coingeckoId?: string;
  };
}

/**
 * Jupiter Price Data
 */
export interface JupiterPrice {
  id: string;
  mintSymbol: string;
  vsToken: string;
  vsTokenSymbol: string;
  price: number;
}

/**
 * Enriched Token sa cenom i dodatnim info
 */
export interface EnrichedJupiterToken extends JupiterToken {
  priceUsd?: number;
  volume24h?: number;
  priceChange24h?: number;
  marketCap?: number;
  createdAt?: number;
}

/**
 * Jupiter Aggregator servis za Solana tokene
 *
 * Jupiter je najveći DEX aggregator na Solana chain-u.
 * Ima listu svih tokena i real-time price data.
 */
export class JupiterService {
  private jupiterApi: AxiosInstance;
  private priceApi: AxiosInstance;
  private tokenCache: JupiterToken[] = [];
  private cacheTime: number = 0;
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minuta

  constructor() {
    // Jupiter Token List API
    this.jupiterApi = axios.create({
      baseURL: 'https://token.jup.ag',
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    // Jupiter Price API v2
    this.priceApi = axios.create({
      baseURL: 'https://api.jup.ag',
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
  }

  /**
   * Preuzmi SVE Solana tokene sa Jupiter-a
   */
  async getAllTokens(forceRefresh: boolean = false): Promise<JupiterToken[]> {
    // Proveri cache
    if (!forceRefresh && this.tokenCache.length > 0 && Date.now() - this.cacheTime < this.CACHE_DURATION) {
      console.log(`📦 Korišćen cache (${this.tokenCache.length} tokena)`);
      return this.tokenCache;
    }

    try {
      console.log('🔄 Preuzimanje token liste sa Jupiter-a...');

      // Jupiter strict token list (verified tokens)
      const response = await this.jupiterApi.get<JupiterToken[]>('/strict');

      this.tokenCache = response.data;
      this.cacheTime = Date.now();

      console.log(`✅ Preuzeto ${this.tokenCache.length} tokena`);
      return this.tokenCache;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Jupiter API greška:', error.message);
        if (error.response?.status === 403) {
          console.log('⚠️  API blokiran - probajte sa /all endpoint-om ili localhost-a');
        }
      }
      throw error;
    }
  }

  /**
   * Preuzmi cene za tokene
   */
  async getPrices(tokenAddresses: string[]): Promise<Map<string, number>> {
    if (tokenAddresses.length === 0) return new Map();

    try {
      // Jupiter Price API v2 - max 100 tokena po request-u
      const chunks = this.chunkArray(tokenAddresses, 100);
      const priceMap = new Map<string, number>();

      for (const chunk of chunks) {
        const ids = chunk.join(',');
        const response = await this.priceApi.get<{ data: Record<string, JupiterPrice> }>(
          `/price/v2?ids=${ids}`
        );

        // Parse response
        for (const [address, priceData] of Object.entries(response.data.data)) {
          priceMap.set(address, priceData.price);
        }

        // Rate limiting
        if (chunks.length > 1) {
          await this.sleep(200);
        }
      }

      return priceMap;
    } catch (error) {
      console.error('❌ Greška pri preuzimanju cena:', error);
      return new Map();
    }
  }

  /**
   * Pronađi nove tokene (tokens sa recent timestamp-om u nazivu ili opisu)
   *
   * NAPOMENA: Jupiter ne pruža creation timestamp direktno.
   * Ova metoda koristi heuristiku za pronalaženje novih tokena.
   */
  async getRecentTokens(limit: number = 50): Promise<EnrichedJupiterToken[]> {
    try {
      const allTokens = await this.getAllTokens();

      // Filter: tokens sa tags "community" ili bez coingecko ID (usually newer)
      const potentialNewTokens = allTokens.filter(token => {
        const hasNoCoinGecko = !token.extensions?.coingeckoId;
        const hasCommunityTag = token.tags?.includes('community');
        return hasNoCoinGecko || hasCommunityTag;
      });

      console.log(`🔍 Pronađeno ${potentialNewTokens.length} potencijalno novih tokena`);

      // Uzmi random sample ako ima previše
      const sample = potentialNewTokens
        .sort(() => Math.random() - 0.5)
        .slice(0, limit);

      // Preuzmi cene
      const addresses = sample.map(t => t.address);
      const prices = await this.getPrices(addresses);

      // Enrichuj sa cenama
      const enriched: EnrichedJupiterToken[] = sample.map(token => ({
        ...token,
        priceUsd: prices.get(token.address) || 0,
      }));

      // Sortiraj po ceni (manji = noviji obično)
      return enriched.sort((a, b) => (a.priceUsd || 0) - (b.priceUsd || 0));
    } catch (error) {
      console.error('❌ Greška pri pronalaženju novih tokena:', error);
      return [];
    }
  }

  /**
   * Pretraži tokene po nazivu/simbolu
   */
  async searchTokens(query: string, limit: number = 20): Promise<EnrichedJupiterToken[]> {
    try {
      const allTokens = await this.getAllTokens();
      const lowerQuery = query.toLowerCase();

      // Search po nazivu i simbolu
      const results = allTokens.filter(token => {
        const matchName = token.name.toLowerCase().includes(lowerQuery);
        const matchSymbol = token.symbol.toLowerCase().includes(lowerQuery);
        return matchName || matchSymbol;
      }).slice(0, limit);

      // Preuzmi cene
      const addresses = results.map(t => t.address);
      const prices = await this.getPrices(addresses);

      // Enrichuj
      const enriched: EnrichedJupiterToken[] = results.map(token => ({
        ...token,
        priceUsd: prices.get(token.address) || 0,
      }));

      return enriched;
    } catch (error) {
      console.error('❌ Greška pri pretrazi:', error);
      return [];
    }
  }

  /**
   * Preuzmi popularne tokene (oni sa coingecko ID-om)
   */
  async getPopularTokens(limit: number = 20): Promise<EnrichedJupiterToken[]> {
    try {
      const allTokens = await this.getAllTokens();

      // Filter: tokeni sa coingecko ID-om (verified/popular)
      const popularTokens = allTokens
        .filter(token => token.extensions?.coingeckoId)
        .slice(0, limit);

      // Preuzmi cene
      const addresses = popularTokens.map(t => t.address);
      const prices = await this.getPrices(addresses);

      // Enrichuj
      const enriched: EnrichedJupiterToken[] = popularTokens.map(token => ({
        ...token,
        priceUsd: prices.get(token.address) || 0,
      }));

      // Sortiraj po ceni (veće = popularnije obično)
      return enriched.sort((a, b) => (b.priceUsd || 0) - (a.priceUsd || 0));
    } catch (error) {
      console.error('❌ Greška pri preuzimanju popularnih tokena:', error);
      return [];
    }
  }

  /**
   * Formatiraj tokene za prikaz
   */
  formatTokens(tokens: EnrichedJupiterToken[], title: string): string {
    if (tokens.length === 0) {
      return `\n${title}\n${'═'.repeat(60)}\n\n❌ Nema tokena za prikaz.\n`;
    }

    let output = `\n${title}\n${'═'.repeat(60)}\n\n`;

    tokens.forEach((token, index) => {
      const price = token.priceUsd && token.priceUsd > 0
        ? `$${this.formatPrice(token.priceUsd)}`
        : 'N/A';

      const tags = token.tags && token.tags.length > 0
        ? ` [${token.tags.join(', ')}]`
        : '';

      const verified = token.extensions?.coingeckoId ? '✓' : '';

      output += `${index + 1}. ${verified} ${token.name} (${token.symbol})${tags}\n`;
      output += `   Cena: ${price}\n`;
      output += `   Adresa: ${token.address}\n`;

      if (token.logoURI) {
        output += `   Logo: ${token.logoURI}\n`;
      }

      output += '\n';
    });

    output += `\n💡 Pronađeno: ${tokens.length} tokena\n`;
    output += `📊 Jupiter Aggregator - Solana chain\n`;

    return output;
  }

  /**
   * Format price helper
   */
  private formatPrice(price: number): string {
    if (price >= 1) {
      return price.toFixed(4);
    } else if (price >= 0.01) {
      return price.toFixed(6);
    } else if (price >= 0.0001) {
      return price.toFixed(8);
    } else {
      return price.toExponential(4);
    }
  }

  /**
   * Chunk array helper
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get token count
   */
  getTokenCount(): number {
    return this.tokenCache.length;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.tokenCache = [];
    this.cacheTime = 0;
    console.log('🗑️  Cache očišćen');
  }
}
