import axios, { AxiosInstance } from 'axios';

/**
 * Pump.fun API Types
 */
export interface PumpFunToken {
  mint: string;
  name: string;
  symbol: string;
  description: string;
  image_uri: string;
  metadata_uri: string;
  twitter?: string;
  telegram?: string;
  bonding_curve: string;
  associated_bonding_curve: string;
  creator: string;
  created_timestamp: number;
  raydium_pool?: string;
  complete: boolean;
  virtual_sol_reserves: number;
  virtual_token_reserves: number;
  total_supply: number;
  website?: string;
  show_name: boolean;
  king_of_the_hill_timestamp?: number;
  market_cap?: number;
  reply_count: number;
  last_reply?: number;
  nsfw: boolean;
  market_id?: string;
  inverted?: boolean;
  usd_market_cap?: number;
}

/**
 * Pump.fun API Service
 * https://pump.fun - Solana memecoin launchpad
 */
export class PumpFunService {
  private api: AxiosInstance;
  private baseUrl = 'https://frontend-api.pump.fun';

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
   * Preuzmi sve tokene sa paginacijom
   */
  async getTokens(
    limit: number = 50,
    offset: number = 0,
    sort: 'created_timestamp' | 'last_reply' | 'market_cap' = 'created_timestamp',
    order: 'asc' | 'desc' = 'desc'
  ): Promise<PumpFunToken[]> {
    try {
      const response = await this.api.get('/coins', {
        params: {
          limit,
          offset,
          sort,
          order,
          includeNsfw: false, // Ne prikazuj NSFW tokene
        },
      });

      return response.data || [];
    } catch (error: any) {
      console.error('❌ Greška pri preuzimanju Pump.fun tokena:', error.message);
      return [];
    }
  }

  /**
   * Preuzmi najnovije tokene
   */
  async getNewestTokens(limit: number = 20): Promise<PumpFunToken[]> {
    return this.getTokens(limit, 0, 'created_timestamp', 'desc');
  }

  /**
   * Preuzmi trending tokene
   */
  async getTrendingTokens(limit: number = 20): Promise<PumpFunToken[]> {
    try {
      const response = await this.api.get('/coins/trending', {
        params: {
          limit,
          includeNsfw: false,
        },
      });

      return response.data || [];
    } catch (error: any) {
      console.error('❌ Greška pri preuzimanju trending tokena sa Pump.fun:', error.message);
      return [];
    }
  }

  /**
   * Preuzmi tokene sortirane po market cap-u
   */
  async getTopByMarketCap(limit: number = 20): Promise<PumpFunToken[]> {
    return this.getTokens(limit, 0, 'market_cap', 'desc');
  }

  /**
   * Pretraži tokene po query-ju
   */
  async searchTokens(query: string): Promise<PumpFunToken[]> {
    try {
      const allTokens = await this.getTokens(100, 0, 'market_cap', 'desc');

      const searchLower = query.toLowerCase();
      return allTokens.filter(token =>
        token.name.toLowerCase().includes(searchLower) ||
        token.symbol.toLowerCase().includes(searchLower) ||
        token.description?.toLowerCase().includes(searchLower)
      );
    } catch (error: any) {
      console.error('❌ Greška pri pretrazi Pump.fun tokena:', error.message);
      return [];
    }
  }

  /**
   * Filtriraj tokene po starosti
   */
  filterByAge(tokens: PumpFunToken[], maxAgeHours: number): PumpFunToken[] {
    const now = Date.now();
    const maxAgeMs = maxAgeHours * 60 * 60 * 1000;

    return tokens.filter(token => {
      const age = now - token.created_timestamp;
      return age <= maxAgeMs;
    });
  }

  /**
   * Filtriraj tokene po market cap-u
   */
  filterByMarketCap(tokens: PumpFunToken[], minMarketCap: number): PumpFunToken[] {
    return tokens.filter(token => {
      return token.usd_market_cap && token.usd_market_cap >= minMarketCap;
    });
  }

  /**
   * Formatuj Pump.fun token za prikaz
   */
  formatToken(token: PumpFunToken, index: number): string {
    const age = this.getTokenAge(token.created_timestamp);
    const marketCap = token.usd_market_cap
      ? `$${this.formatNumber(token.usd_market_cap)}`
      : 'N/A';

    const completed = token.complete ? '✅ Graduated' : '🔄 Bonding';
    const hasRaydium = token.raydium_pool ? '🔥 Raydium' : '';

    let output = `${index + 1}. 💎 ${token.name} (${token.symbol})\n`;
    output += `   📊 Market Cap: ${marketCap}\n`;
    output += `   ⏰ Starost: ${age}\n`;
    output += `   📍 Status: ${completed} ${hasRaydium}\n`;

    if (token.description && token.description.length > 0) {
      const desc = token.description.substring(0, 60);
      output += `   📝 ${desc}${token.description.length > 60 ? '...' : ''}\n`;
    }

    if (token.twitter) output += `   🐦 Twitter\n`;
    if (token.telegram) output += `   📱 Telegram\n`;
    if (token.website) output += `   🌐 Website\n`;

    output += `   📍 Mint: ${token.mint}\n`;
    output += `\n`;

    return output;
  }

  /**
   * Formatuj listu tokena
   */
  formatTokenList(tokens: PumpFunToken[], title: string): string {
    if (tokens.length === 0) {
      return '\n❌ Nema pronađenih Pump.fun tokena.\n';
    }

    let output = `\n${'═'.repeat(60)}\n`;
    output += `  ${title}\n`;
    output += `${'═'.repeat(60)}\n\n`;

    tokens.forEach((token, index) => {
      output += this.formatToken(token, index);
    });

    output += `${'═'.repeat(60)}\n`;
    output += `💡 Da dodate token: add <mint_adresa>\n`;
    output += `💡 Pump.fun: https://pump.fun/coin/${tokens[0]?.mint || ''}\n`;
    output += `${'═'.repeat(60)}\n`;

    return output;
  }

  /**
   * Dobij starost tokena u čitljivom formatu
   */
  private getTokenAge(timestamp: number): string {
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
}
