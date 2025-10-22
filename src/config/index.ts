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

  return {
    tokenAddresses,
    checkInterval,
    priceChangeAlertThreshold,
    defaultChain,
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
