#!/bin/bash

# 🚀 Memecoin Bot - Setup Script
# Automatski setup projekta

echo "🚀 Memecoin Bot - Setup"
echo "======================="
echo ""

# Proveri Node.js verziju
echo "📋 Proveravam Node.js verziju..."
NODE_VERSION=$(node -v 2>&1)
if [ $? -ne 0 ]; then
    echo "❌ Node.js nije instaliran!"
    echo "Preuzmi sa: https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js: $NODE_VERSION"
echo ""

# Proveri npm verziju
echo "📋 Proveravam npm verziju..."
NPM_VERSION=$(npm -v 2>&1)
echo "✅ npm: $NPM_VERSION"
echo ""

# Instaliraj zavisnosti
echo "📦 Instaliram zavisnosti..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ npm install failed!"
    exit 1
fi
echo "✅ Zavisnosti instalirane"
echo ""

# Build projekat
echo "🔨 Build-ujem projekat..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi
echo "✅ Build uspešan"
echo ""

# Proveri da li dist postoji
if [ ! -d "dist" ]; then
    echo "❌ dist folder ne postoji nakon build-a!"
    exit 1
fi

if [ ! -f "dist/index.js" ]; then
    echo "❌ dist/index.js ne postoji!"
    exit 1
fi

echo "✅ dist folder kreiran"
echo ""

# Kopiraj .env.example u .env ako ne postoji
if [ ! -f ".env" ]; then
    echo "📄 Kreiram .env fajl..."
    cp .env.example .env
    echo "✅ .env fajl kreiran"
    echo ""
fi

echo "🎉 Setup završen uspešno!"
echo ""
echo "📝 Sada možeš pokrenuti bota:"
echo "   npm start"
echo ""
echo "💡 Za pomoć:"
echo "   npm start, zatim kucaj 'help'"
echo ""
