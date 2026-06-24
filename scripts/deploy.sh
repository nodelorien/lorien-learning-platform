#!/usr/bin/env bash
set -euo pipefail

# Lorien Learning Platform — deploy for 500MB RAM VPS
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

echo "=== 3. Building frontend ==="
cd frontend
NODE_ENV=production NODE_OPTIONS="--max-old-space-size=384" npx next build
cd "$ROOT_DIR"

echo "=== 4. Starting processes ==="
export NODE_ENV=production

# Start backend API (port 4000, heap 128MB)
node --max-old-space-size=128 dist/server.js &
BACKEND_PID=$!

# Start frontend (port 3001, heap 256MB)
cd frontend
PORT=3001 NODE_OPTIONS="--max-old-space-size=256" npx next start &
FRONTEND_PID=$!
cd "$ROOT_DIR"

echo "Backend PID: $BACKEND_PID (port 4000, heap 128MB)"
echo "Frontend PID: $FRONTEND_PID (port 3001, heap 256MB)"

trap 'kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' SIGTERM SIGINT
wait
