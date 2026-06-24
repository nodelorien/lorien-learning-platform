#!/usr/bin/env bash
set -euo pipefail

# Production startup for Lorien Learning Platform
# Optimized for 1GB RAM VPS — single Node.js process

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "=== Building frontend (static export) ==="
cd frontend
npm ci --production=false
cp .env.production .env
npx next build
cd ..

echo "=== Building backend ==="
npm ci --production=false
npx tsc

echo "=== Starting production server ==="
export NODE_ENV=production
exec node --max-old-space-size=512 dist/server.js
