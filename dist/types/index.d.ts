/**
 * Tipovi i interfejsi za Memecoin Bot
 */
export interface DexPair {
    chainId: string;
    dexId: string;
    url: string;
    pairAddress: string;
    baseToken: {
        address: string;
        name: string;
        symbol: string;
    };
    quoteToken: {
        address: string;
        name: string;
        symbol: string;
    };
    priceNative: string;
    priceUsd: string;
    txns: {
        m5: {
            buys: number;
            sells: number;
        };
        h1: {
            buys: number;
            sells: number;
        };
        h6: {
            buys: number;
            sells: number;
        };
        h24: {
            buys: number;
            sells: number;
        };
    };
    volume: {
        m5: number;
        h1: number;
        h6: number;
        h24: number;
    };
    priceChange: {
        m5: number;
        h1: number;
        h6: number;
        h24: number;
    };
    liquidity: {
        usd: number;
        base: number;
        quote: number;
    };
    fdv: number;
    marketCap: number;
    pairCreatedAt: number;
}
export interface TokenData {
    address: string;
    name: string;
    symbol: string;
    price: number;
    priceChange24h: number;
    volume24h: number;
    liquidity: number;
    marketCap: number;
    pairs: DexPair[];
    lastUpdated: Date;
}
export interface PriceAlert {
    tokenAddress: string;
    tokenSymbol: string;
    oldPrice: number;
    newPrice: number;
    changePercent: number;
    timestamp: Date;
}
export interface BotConfig {
    tokenAddresses: string[];
    checkInterval: number;
    priceChangeAlertThreshold: number;
    defaultChain: string;
    autoDiscoveryEnabled: boolean;
    discoveryInterval: number;
    discoverySearchQuery: string;
    minLiquidity: number;
    minVolume24h: number;
    maxTokenAgeHours: number;
}
//# sourceMappingURL=index.d.ts.map