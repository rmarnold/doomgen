#!/bin/bash
set -e
echo "=== DOOMGEN Full Test Cycle ==="

cd /Users/rarnold/Projects/doomgen

echo "Step 1: Clean install"
rm -rf node_modules
npm ci

echo "Step 2: Type check"
npx svelte-check

echo "Step 3: Build"
npm run build

echo "Step 4: Run unit tests"
bash UNITTEST/test-build.sh

echo "Step 5: Preview build"
echo "Starting preview server on port 4173..."
echo "Visit http://localhost:4173/doomgen/ to verify"
echo "Press Ctrl+C to stop"
npm run preview

echo ""
echo "=== Full test cycle complete ==="
