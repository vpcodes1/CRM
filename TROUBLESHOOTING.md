# 🔧 Troubleshooting - Memecoin Bot

## ❌ Greška: "Cannot find module '/path/to/dist/index.js'"

### Problem:
```
Error: Cannot find module '/Users/vukasin/Desktop/mem/dist/index.js'
```

### Razlog:
`dist` folder ne postoji ili projekat nije build-ovan.

### ✅ Rešenje:

```bash
# 1. Idi u folder projekta
cd /Users/vukasin/Desktop/mem

# 2. Instaliraj zavisnosti (ako nisi)
npm install

# 3. Build projekat (OBAVEZNO!)
npm run build

# 4. Proveri da li dist postoji
ls dist/

# 5. Sada pokreni
npm start
```

## 🔍 Provera da li je sve OK:

```bash
# Proveri da li postoje potrebni folderi
ls -la

# Trebalo bi da vidiš:
# - src/          (source kod)
# - dist/         (compiled kod)
# - node_modules/ (zavisnosti)
# - package.json
# - tsconfig.json
```

## ⚠️ Česte greške:

### 1. `dist` folder ne postoji
**Rešenje:** Pokreni `npm run build`

### 2. "Module not found" za axios, dotenv itd
**Rešenje:** Pokreni `npm install`

### 3. TypeScript greške pri build-u
**Rešenje:** Proveri verziju Node.js
```bash
node --version  # Treba biti 16+
npm --version
```

### 4. Permission errors na Mac/Linux
**Rešenje:**
```bash
# Dodaj execute permisiju
chmod +x dist/index.js
```

## 🚀 BRZI FIX (Copy-Paste):

```bash
# Izvršite ovo u terminalu:
cd /Users/vukasin/Desktop/mem
rm -rf node_modules dist
npm install
npm run build
npm start
```

## 📝 Provera instalacije:

```bash
# 1. Proveri Node.js verziju
node --version
# Treba biti v16.0.0 ili novija

# 2. Proveri npm verziju
npm --version

# 3. Proveri da li TypeScript kompajlira
npm run build
# Ne bi trebalo da bude grešaka

# 4. Proveri dist folder
ls -la dist/
# Trebalo bi da vidiš index.js i sve servise

# 5. Pokreni bota
npm start
# Trebalo bi da vidiš banner
```

## 🎯 Finalna provera:

Ako sve radi trebalo bi da vidiš:

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 MEMECOIN BOT - DEX SCREENER TRACKER 🚀              ║
║                                                           ║
║   📊 Praćenje cena u realnom vremenu                     ║
║   💰 Automatski alerti                                    ║
║   📈 Analiza tržišta                                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

💡 Nema podešenih tokena u .env fajlu.
💡 Koristite komandu "add <adresa>" da dodate token za praćenje.

memecoin-bot>
```

## 🆘 Još uvek ne radi?

1. **Obriši sve i kreni ispočetka:**
```bash
cd /Users/vukasin/Desktop/mem
rm -rf node_modules dist package-lock.json
npm install
npm run build
npm start
```

2. **Kloniraj projekat ponovo:**
```bash
cd ~/Desktop
rm -rf mem
git clone <repository-url> mem
cd mem
npm install
npm run build
npm start
```

3. **Proveri verzije:**
```bash
node --version   # Minimum v16.0.0
npm --version    # Minimum v8.0.0
```

4. **Mac specifično - M1/M2 čipovi:**
```bash
# Ako imaš M1/M2 Mac
arch -x86_64 npm install
npm run build
npm start
```

## 📞 Kontakt

Ako ništa ne radi, otvori issue na GitHub-u sa:
- Output od `node --version`
- Output od `npm --version`
- Output od `npm run build`
- Screenshot greške
