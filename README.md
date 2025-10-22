# 🚀 Memecoin Bot - DEX Screener Tracker

AI bot za praćenje cena meme coina u realnom vremenu koristeći DEX Screener API.

## 🌟 Funkcionalnosti

- 📊 **Praćenje cena u realnom vremenu** - Automatsko ažuriranje cena za praćene tokene
- 💰 **Automatski alerti** - Obaveštenja kada cena promeni iznad određenog praga
- 📈 **Istorija cena** - Čuvanje i prikaz istorije cena za svaki token
- 📉 **Statistika** - Min/max/prosečna cena za praćene tokene
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

| Komanda | Opis | Primer |
|---------|------|--------|
| `add <address>` | Dodaj token za praćenje | `add 0x1234...` |
| `remove <address>` | Ukloni token iz praćenja | `remove 0x1234...` |
| `list` | Prikaži sve praćene tokene | `list` |
| `history <address>` | Prikaži istoriju cena | `history 0x1234... 20` |
| `stats <address>` | Prikaži statistiku za token | `stats 0x1234...` |
| `search <query>` | Pretraži tokene | `search PEPE` |
| `start` | Pokreni automatsko praćenje | `start` |
| `stop` | Zaustavi automatsko praćenje | `stop` |
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

### 4. Automatski alerti
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
