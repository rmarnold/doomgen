#!/bin/bash
set -e
echo "=== DOOMGEN Build Test ==="

cd /Users/rarnold/Projects/doomgen

echo "1. Running svelte-check..."
npx svelte-check
echo "   ✓ Type check passed"

echo "2. Running production build..."
npm run build
echo "   ✓ Build succeeded"

echo "3. Verifying build output..."
if [ -f build/index.html ]; then
  echo "   ✓ index.html exists"
else
  echo "   ✗ index.html missing!" && exit 1
fi

if [ -d build/_app ]; then
  echo "   ✓ _app directory exists"
else
  echo "   ✗ _app directory missing!" && exit 1
fi

if [ -f build/fonts/JetBrainsMono-Variable.woff2 ]; then
  echo "   ✓ JetBrains Mono font exists"
else
  echo "   ✗ JetBrains Mono font missing!" && exit 1
fi

echo "4. Checking bundle size..."
TOTAL=$(du -sh build/ | cut -f1)
echo "   Total build size: $TOTAL"

echo ""
echo "=== All tests passed ==="
