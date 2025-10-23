# 🚀 Memecoin Bot - DEX Screener Tracker

AI bot za praćenje cena meme coina u realnom vremenu koristeći DEX Screener API.

## 🌟 Funkcionalnosti

### Praćenje tokena
- 📊 **Praćenje cena u realnom vremenu** - Automatsko ažuriranje cena za praćene tokene
- 💰 **Automatski alerti** - Obaveštenja kada cena promeni iznad određenog praga
- 📈 **Istorija cena** - Čuvanje i prikaz istorije cena za svaki token
- 📉 **Statistika** - Min/max/prosečna cena za praćene tokene

### Automatsko pronalaženje tokena (NOVO!)
- 🔥 **Trending tokeni** - Pronalazi tokene sa najvećim volumenom
- 🆕 **Novi tokeni** - Automatski pronalazi sveže izašle tokene
- 🚀 **Top gainers** - Tokeni sa najvećim rastom u 24h
- 📉 **Top losers** - Tokeni sa najvećim padom u 24h
- 🤖 **Auto-discovery mod** - Bot automatski pronalazi i prikazuje nove i trending tokene
- 🛡️ **Sigurnosni filteri** - Automatski filtrira scam tokene (min. likvidnost, volumen)

### Ostalo
- 🔍 **Pretraga** - Pretraživanje tokena po nazivu ili simbolu
- 🎯 **DEX Screener integracija** - Direktna integracija sa DEX Screener API-jem
- 💡 **Interaktivni CLI** - Laka upotreba kroz komandnu liniju

## 📋 Preduslovi

- Node.js (verzija 16 ili novija)
- npm ili yarn

## 🚀 Instalacija

1. **Klonirajte ili preuzmite projekat**

2. **Instalirajte zavisnosti:**
```bash
npm install
```

3. **Konfigurišite .env fajl:**
```bash
cp .env.example .env
```

Uredite `.env` fajl i dodajte adrese tokena koje želite da pratite:
```env
# Prati ove tokene (odvojene zarezom)
TOKEN_ADDRESSES=TokenAddress1,TokenAddress2

# Interval provere u milisekundama (default: 60000 = 1 minut)
CHECK_INTERVAL=60000

# Prag za upozorenje o promeni cene (u procentima)
PRICE_CHANGE_ALERT_THRESHOLD=5

# Chain (ethereum, bsc, polygon, solana, itd.)
DEFAULT_CHAIN=solana
```

4. **Build projekta:**
```bash
npm run build
```

## 🎮 Pokretanje

### Development mod
```bash
npm run dev
```

### Production mod
```bash
npm start
```

## 📖 Komande

Bot koristi interaktivni CLI sa sledećim komandama:

### 🎯 Praćenje tokena

| Komanda | Opis | Primer |
|---------|------|--------|
| `add <address>` | Dodaj token za praćenje | `add 0x1234...` |
| `remove <address>` | Ukloni token iz praćenja | `remove 0x1234...` |
| `list` | Prikaži sve praćene tokene | `list` |
| `history <address>` | Prikaži istoriju cena | `history 0x1234... 20` |
| `stats <address>` | Prikaži statistiku za token | `stats 0x1234...` |
| `start` | Pokreni automatsko praćenje | `start` |
| `stop` | Zaustavi automatsko praćenje | `stop` |

### 🔍 Pronalaženje tokena (NOVO!)

| Komanda | Opis | Primer |
|---------|------|--------|
| `trending [query]` | Prikaži trending tokene po volumenu | `trending solana` |
| `new [query] [hours]` | Prikaži nove tokene (default 24h) | `new solana 6` |
| `gainers [query]` | Prikaži top gainers (24h) | `gainers` |
| `losers [query]` | Prikaži top losers (24h) | `losers ethereum` |
| `search <query>` | Pretraži tokene po nazivu | `search PEPE` |

### 🤖 Auto-discovery (NOVO!)

| Komanda | Opis | Primer |
|---------|------|--------|
| `discovery-start` | Pokreni automatsko pronalaženje | `discovery-start` |
| `discovery-stop` | Zaustavi auto-discovery | `discovery-stop` |

### ⚙️ Ostalo

| Komanda | Opis | Primer |
|---------|------|--------|
| `clear` | Obriši ekran | `clear` |
| `help` | Prikaži pomoć | `help` |
| `exit` / `quit` | Izađi iz bota | `exit` |

## 📊 Primeri upotrebe

### 1. Dodavanje tokena za praćenje
```
memecoin-bot> add 0x1234567890abcdef1234567890abcdef12345678
✅ Token PEPE dodat u praćenje
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 PepeCoin (PEPE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💵 Cena: $0.00000123
📈 24h promena: +15.43%
📊 Volume 24h: $1.23M
💧 Likvidnost: $456.78K
🏦 Market Cap: $12.34M
📍 Broj parova: 5
🕐 Ažurirano: 14:30:25
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 2. Pretraga tokena
```
memecoin-bot> search dogecoin
🔍 Pretraga za: "dogecoin"...

✅ Pronađeno 10 rezultata:

1. Dogecoin (DOGE)
   Adresa: 0xba2ae424d960c26247dd6c32edc70b295c744c43
   Cena: $0.08234
   DEX: uniswap-v2 (ethereum)
```

### 3. Prikaz praćenih tokena
```
memecoin-bot> list

📊 PRAĆENI TOKENI:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 PepeCoin (PEPE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💵 Cena: $0.00000123
📈 24h promena: +15.43%
...
```

### 4. Pronalaženje trending tokena (NOVO!)
```
memecoin-bot> trending

════════════════════════════════════════════════════════════
  🔥 TRENDING TOKENI
════════════════════════════════════════════════════════════

1. 🟢 Bonk (BONK)
   💵 Cena: $0.00001234
   📊 24h: +45.23%
   📈 Volume: $5.67M
   💧 Likvidnost: $1.23M
   🔗 Chain: solana | DEX: raydium
   ⏰ Starost: 15 dana
   📍 Adresa: DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263

💡 Da dodate token: add <adresa>
```

### 5. Pronalaženje novih tokena (NOVO!)
```
memecoin-bot> new solana 6

════════════════════════════════════════════════════════════
  🆕 NOVI TOKENI
════════════════════════════════════════════════════════════

1. 🟢 MoonDog (MDOG)
   💵 Cena: $0.000045
   📊 24h: +125.43%
   📈 Volume: $234.56K
   💧 Likvidnost: $45.67K
   🔗 Chain: solana | DEX: raydium
   ⏰ Starost: 3 sati
   📍 Adresa: ...

💡 Da dodate token: add <adresa>
```

### 6. Auto-discovery mod (NOVO!)
```
memecoin-bot> discovery-start
🤖 Auto-discovery pokrenut (interval: 300s)

# Bot sada automatski prikazuje nove i trending tokene svakih 5 minuta!
# Ne morate ručno da tražite - bot radi za vas!
```

### 7. Automatski alerti
Kada cena promeni više od podešenog praga:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 ALERT: PROMENA CENE 🚀
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💎 Token: PEPE
⬆️ Promena: +8.52%
📊 Stara cena: $0.00000123
💰 Nova cena: $0.00000133
🕐 Vreme: 22.10.2025. 14:35:00
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🔧 Konfiguracija

### TOKEN_ADDRESSES
Lista adresa tokena odvojenih zarezom. Bot će automatski učitati ove tokene pri pokretanju.

### CHECK_INTERVAL
Interval u milisekundama između provera cena. Minimum je 10000ms (10 sekundi) da bi se izbegle rate limit greške.

**Preporučene vrednosti:**
- `60000` - 1 minut (preporučeno)
- `300000` - 5 minuta
- `900000` - 15 minuta

### PRICE_CHANGE_ALERT_THRESHOLD
Prag u procentima za prikazivanje alerta. Ako cena promeni više od ovog praga, bot će prikazati upozorenje.

**Primeri:**
- `5` - Alert pri promeni ≥5%
- `10` - Alert pri promeni ≥10%
- `1` - Alert pri promeni ≥1% (vrlo osetljivo)

### AUTO_DISCOVERY_ENABLED (NOVO!)
Uključi/isključi automatsko pronalaženje novih tokena.

**Vrednosti:**
- `true` - Bot automatski prikazuje nove i trending tokene
- `false` - Isključeno (default)

### DISCOVERY_INTERVAL (NOVO!)
Interval u milisekundama za auto-discovery provere.

**Preporučene vrednosti:**
- `300000` - 5 minuta (preporučeno)
- `600000` - 10 minuta
- `900000` - 15 minuta

### MIN_LIQUIDITY (NOVO!)
Minimum likvidnost u USD za sigurnost. Tokeni ispod ovog praga se filtriraju.

**Preporučene vrednosti:**
- `5000` - $5k minimum (default, preporučeno)
- `10000` - $10k (konzervativnije)
- `1000` - $1k (rizičnije)

### MIN_VOLUME_24H (NOVO!)
Minimum 24h volumen u USD. Tokeni ispod ovog praga se filtriraju.

**Preporučene vrednosti:**
- `1000` - $1k minimum (default)
- `5000` - $5k (konzervativnije)
- `500` - $500 (rizičnije)

## 🔒 API Limits

DEX Screener ima rate limits:
- **300 zahteva u minuti** za besplatne korisnike
- Bot automatski dodaje pauze između poziva

**Saveti:**
- Koristite interval od minimum 10 sekundi
- Pratite manji broj tokena ako želite češće provere
- Bot automatski dodaje pauze od 500ms između poziva

## 📁 Struktura projekta

```
CRM/
├── src/
│   ├── config/
│   │   └── index.ts          # Konfiguracija
│   ├── services/
│   │   ├── dexscreener.ts    # DEX Screener API integracija
│   │   ├── priceTracker.ts   # Praćenje cena
│   │   └── alertService.ts   # Alert sistem
│   ├── types/
│   │   └── index.ts          # TypeScript tipovi
│   └── index.ts              # Glavni bot fajl
├── .env.example              # Primer konfiguracije
├── tsconfig.json             # TypeScript konfiguracija
├── package.json              # Zavisnosti
└── README.md                 # Dokumentacija
```

## 🐛 Troubleshooting

### "Rate limit dostignut"
- Povećajte `CHECK_INTERVAL` u .env fajlu
- Smanjite broj praćenih tokena

### "Token nije pronađen"
- Proverite da li je adresa tokena ispravna
- Uverite se da token postoji na DEX Screener-u
- Proverite da li pratite token na pravom chain-u

### Bot se ne pokreće
```bash
# Proverite da li su zavisnosti instalirane
npm install

# Pokrenite build
npm run build

# Pokrenite u dev modu za više informacija
npm run dev
```

## 🤝 Doprinos

Slobodno otvorite issue ili pošaljite pull request!

## 📄 Licenca

ISC

## ⚠️ Disclaimer

Ovaj bot je napravljen u edukativne svrhe. Ne koristi ga kao jedini izvor informacija za trgovinske odluke. Uvek uradite svoju sopstvenu analizu pre investiranja.

---

**Napravljeno sa ❤️ koristeći DEX Screener API**
