#!/usr/bin/env bash
set -euo pipefail

# Lorien Learning Platform — single-command deploy for 500MB RAM VPS
# Usage: bash scripts/deploy.sh

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "=== 1. Installing dependencies ==="
npm install --production=false
cd frontend
npm install --production=false
cd "$ROOT_DIR"

echo "=== 2. Building backend ==="
npx tsc

echo "=== 3. Building frontend (static export) ==="
cd frontend
NODE_ENV=production NODE_OPTIONS="--max-old-space-size=384" npx next build
cd "$ROOT_DIR"

echo "=== 4. Starting production server (256MB heap) ==="
export NODE_ENV=production
exec node --max-old-space-size=256 dist/server.js
