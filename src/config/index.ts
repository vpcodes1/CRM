import * as dotenv from 'dotenv';
import { BotConfig } from '../types';

// Učitaj .env fajl
dotenv.config();

/**
 * Učitaj konfiguraciju bota
 */
export function loadConfig(): BotConfig {
  const tokenAddresses = process.env.TOKEN_ADDRESSES
    ? process.env.TOKEN_ADDRESSES.split(',').map(addr => addr.trim()).filter(addr => addr.length > 0)
    : [];

  const checkInterval = parseInt(process.env.CHECK_INTERVAL || '60000', 10);
  const priceChangeAlertThreshold = parseFloat(process.env.PRICE_CHANGE_ALERT_THRESHOLD || '5');
  const defaultChain = process.env.DEFAULT_CHAIN || 'solana';

  // Discovery settings
  const autoDiscoveryEnabled = process.env.AUTO_DISCOVERY_ENABLED === 'true';
  const discoveryInterval = parseInt(process.env.DISCOVERY_INTERVAL || '300000', 10); // 5 min default
  const discoverySearchQuery = process.env.DISCOVERY_SEARCH_QUERY || 'solana';
  const minLiquidity = parseFloat(process.env.MIN_LIQUIDITY || '5000');
  const minVolume24h = parseFloat(process.env.MIN_VOLUME_24H || '1000');
  const maxTokenAgeHours = parseFloat(process.env.MAX_TOKEN_AGE_HOURS || '24');

  return {
    tokenAddresses,
    checkInterval,
    priceChangeAlertThreshold,
    defaultChain,
    autoDiscoveryEnabled,
    discoveryInterval,
    discoverySearchQuery,
    minLiquidity,
    minVolume24h,
    maxTokenAgeHours,
  };
}

/**
 * Validacija konfiguracije
 */
export function validateConfig(config: BotConfig): boolean {
  if (config.checkInterval < 10000) {
    console.warn('⚠️  CHECK_INTERVAL je manji od 10 sekundi. Preporučuje se minimum 10000ms (10s) da bi se izbegle rate limit greške.');
  }

  if (config.priceChangeAlertThreshold < 0) {
    console.error('❌ PRICE_CHANGE_ALERT_THRESHOLD mora biti pozitivan broj.');
    return false;
  }

  return true;
}
