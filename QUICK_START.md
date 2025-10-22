# 🚀 Quick Start Guide - Memecoin Bot

## 1️⃣ Instalacija (prvi put)

```bash
# Instalirajte zavisnosti
npm install

# Buildujte projekat
npm run build
```

## 2️⃣ Osnovna upotreba

### Opcija A: Bez konfiguracije (Preporučeno za početnike)

Pokrenite bota i dodajte tokene ručno:

```bash
npm start
```

Zatim u bot konzoli:
```
memecoin-bot> search PEPE
memecoin-bot> add <adresa_tokena_iz_pretrage>
memecoin-bot> start
```

### Opcija B: Sa konfiguracijom

1. **Uredite .env fajl:**
```bash
# .env
TOKEN_ADDRESSES=<adresa_tokena1>,<adresa_tokena2>
CHECK_INTERVAL=60000
PRICE_CHANGE_ALERT_THRESHOLD=5
```

2. **Pokrenite bota:**
```bash
npm start
```

## 3️⃣ Kako pronaći adresu tokena?

### Metod 1: Kroz bota (najlakše)
```
memecoin-bot> search dogecoin
# Bot će prikazati listu tokena sa adresama
```

### Metod 2: DEX Screener web
1. Idite na https://dexscreener.com/
2. Pretražite token
3. Kopirajte contract address

### Metod 3: CoinGecko/CoinMarketCap
1. Pronađite token
2. Pogledajte "Contracts" sekciju
3. Kopirajte adresu za željeni chain

## 4️⃣ Primeri popularnih tokena

### Solana memecoin primeri:
```bash
# Ovo su PRIMERI - proverite aktuelne adrese!
# BONK
TOKEN_ADDRESSES=DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263

# WIF (dogwifhat)
TOKEN_ADDRESSES=EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm
```

### Ethereum memecoin primeri:
```bash
# PEPE
TOKEN_ADDRESSES=0x6982508145454Ce325dDbE47a25d4ec3d2311933

# SHIB
TOKEN_ADDRESSES=0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce
```

## 5️⃣ Najčešće komande

| Šta želite | Komanda |
|------------|---------|
| Dodati token | `add <adresa>` |
| Videti sve tokene | `list` |
| Pokrenuti automatsko praćenje | `start` |
| Zaustaviti praćenje | `stop` |
| Pretraživati tokene | `search <naziv>` |
| Videti istoriju | `history <adresa>` |
| Izaći | `exit` |

## 6️⃣ Saveti za početnike

### ✅ DOBRO:
- Počnite sa 1-3 tokena
- Koristite interval od 60000ms (1 minut)
- Postavite prag na 5% za početak
- Testirajte sa poznatim tokenima prvo

### ❌ IZBEGAVAJTE:
- Više od 10 tokena odjednom (rate limits)
- Intervale manje od 10 sekundi
- Dodavanje nepoznatih/scam tokena

## 7️⃣ Primer sesije

```bash
$ npm start

# Bot se pokreće...

memecoin-bot> search dogecoin
🔍 Pronađeno 5 rezultata...
1. Dogecoin (DOGE) - Adresa: 0xba2ae424d960c26247dd6c32edc70b295c744c43

memecoin-bot> add 0xba2ae424d960c26247dd6c32edc70b295c744c43
✅ Token DOGE dodat

memecoin-bot> list
📊 PRAĆENI TOKENI:
💰 Dogecoin (DOGE)
💵 Cena: $0.08234
...

memecoin-bot> start
✅ Automatsko praćenje pokrenuto

# Bot sada automatski prati cenu i prikazuje alerte!
```

## 8️⃣ Troubleshooting

### Problem: "Rate limit dostignut"
**Rešenje:** Povećajte CHECK_INTERVAL u .env na 120000 (2 minuta)

### Problem: "Token nije pronađen"
**Rešenje:**
- Proverite da li je adresa ispravna
- Pokušajte da pretražite token kroz `search` komandu
- Proverite da li token postoji na DEX Screener-u

### Problem: Nema podataka
**Rešenje:**
- Sačekajte 1-2 minuta da bot prikupi podatke
- Koristite `list` komandu da vidite aktuelne podatke

## 9️⃣ Development mod

Za development sa automatskim reloadom:
```bash
npm run dev
```

## 🔟 Pomoć

Unutar bota:
```
memecoin-bot> help
```

Za više informacija pogledajte [README.md](./README.md)

---

**Srećno trgovanje! 🚀💰**

*Napomena: Ovo nije finansijski savet. Uvek radite svoju analizu.*
