# 🆘 QUICK FIX - "Cannot find module dist/index.js"

## ❓ Zašto se ovo dešava?

**dist** folder **NIKAD** ne ide u Git repo. Kada kloniraš projekat, **MORAŠ** da pokreneš `npm run build` da bi ga kreirao.

```
Git Repo (GitHub)          Tvoj računar
├── src/  ✅               ├── src/  ✅
├── package.json  ✅       ├── package.json  ✅
├── tsconfig.json  ✅      ├── tsconfig.json  ✅
└── dist/  ❌ NIJE OVDE!   └── dist/  ❌ MORAŠ DA KREIRAŠ!
```

## ✅ INSTANT FIX (Garantovano radi):

### Metod 1: Automatski Setup Script

```bash
cd /Users/vukasin/Desktop/mem
chmod +x setup.sh
./setup.sh
```

### Metod 2: Ručno (Korak-po-korak)

```bash
# 1. Idi u projekat
cd /Users/vukasin/Desktop/mem

# 2. Obriši stare fajlove
rm -rf node_modules dist package-lock.json

# 3. Instaliraj zavisnosti
npm install

# 4. BUILD (ovo kreira dist folder!)
npm run build

# 5. PROVERI da li je dist kreiran
ls -la dist/

# Ako vidiš dist/index.js → SUCCESS! ✅
# Ako ne vidiš → Idi na "Debugging" dole ⬇️

# 6. Pokreni bota
npm start
```

## 🔍 PROVERA - Da li je build uspeo?

```bash
# Idi u projekat
cd /Users/vukasin/Desktop/mem

# Proveri da li dist postoji
ls dist/

# Trebalo bi da vidiš:
# config/
# services/
# types/
# index.js ← NAJVAŽNIJE!
# index.d.ts
# index.js.map
```

## 🐛 DEBUGGING - Ako ne radi:

### 1. Proveri da li build ima greške:

```bash
npm run build 2>&1 | tee build-log.txt
cat build-log.txt
```

Ako vidiš BILO KAKVE greške, pošalji mi output!

### 2. Proveri Node.js verziju:

```bash
node --version
# Treba biti v16.0.0 ili novija!

# Ako je starija, preuzmi sa:
# https://nodejs.org/en/download/
```

### 3. TypeScript greške?

```bash
# Proveri da li TypeScript radi:
npx tsc --version

# Instaliraj TypeScript globalno:
npm install -g typescript

# Pokušaj build ponovo:
npm run build
```

### 4. Permissions na Mac-u?

```bash
# Dodaj execute permisije:
chmod +x setup.sh

# Proveri ownership:
ls -la

# Ako treba, uzmi ownership:
sudo chown -R $(whoami) /Users/vukasin/Desktop/mem
```

## 🎯 Šta radi `npm run build`?

```
npm run build
  ↓
Pokreće: tsc (TypeScript Compiler)
  ↓
Čita: tsconfig.json
  ↓
Kompajlira: src/**/*.ts → dist/**/*.js
  ↓
Kreira: dist/ folder
  ↓
npm start može da pokrene: dist/index.js
```

## 📝 Proveri tsconfig.json:

```bash
cat tsconfig.json
```

Trebalo bi da vidiš:
```json
{
  "compilerOptions": {
    "outDir": "./dist",    ← MORA BITI ./dist
    "rootDir": "./src",    ← MORA BITI ./src
    ...
  }
}
```

## 🔄 NUKLEARNA OPCIJA - Ako NIŠTA ne radi:

```bash
# Obriši projekat
cd ~/Desktop
rm -rf mem

# Kloniraj ponovo
git clone <YOUR_REPO_URL> mem
cd mem

# Fresh install
npm install

# Build
npm run build

# Proveri dist
ls -la dist/

# Start
npm start
```

## 💡 Mac M1/M2 Specifično:

Ako imaš Apple Silicon (M1/M2 čip):

```bash
# Možda trebaš da pokreneš sa Rosetta:
arch -x86_64 npm install
npm run build
npm start
```

## 📧 Još uvek ne radi?

Pošalji mi:

1. **Node verziju:**
   ```bash
   node --version
   npm --version
   ```

2. **Build output:**
   ```bash
   npm run build 2>&1 | tee build-error.txt
   cat build-error.txt
   ```

3. **Folder struktura:**
   ```bash
   ls -la
   ls -la src/
   ls -la dist/ 2>&1 || echo "dist ne postoji"
   ```

4. **tsconfig.json:**
   ```bash
   cat tsconfig.json
   ```

---

## ✅ Kada sve radi, trebalo bi da vidiš:

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

memecoin-bot> _
```

Ako vidiš ovo ☝️ → **SUCCESS!** 🎉
