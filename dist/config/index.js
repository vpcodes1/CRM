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
exports.loadConfig = loadConfig;
exports.validateConfig = validateConfig;
const dotenv = __importStar(require("dotenv"));
// Učitaj .env fajl
dotenv.config();
/**
 * Učitaj konfiguraciju bota
 */
function loadConfig() {
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
function validateConfig(config) {
    if (config.checkInterval < 10000) {
        console.warn('⚠️  CHECK_INTERVAL je manji od 10 sekundi. Preporučuje se minimum 10000ms (10s) da bi se izbegle rate limit greške.');
    }
    if (config.priceChangeAlertThreshold < 0) {
        console.error('❌ PRICE_CHANGE_ALERT_THRESHOLD mora biti pozitivan broj.');
        return false;
    }
    return true;
}
//# sourceMappingURL=index.js.map