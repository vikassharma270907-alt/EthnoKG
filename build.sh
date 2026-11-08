#!/usr/bin/env bash
# Render Unified Build Script for EthnoKG
set -o errexit
set -o pipefail

echo "==> 1. Installing Python dependencies..."
pip install -r backend/requirements.txt

# Ensure Node.js and npm are available (handles native Python environments)
if ! command -v npm &> /dev/null; then
  echo "==> Node.js/npm not detected in native environment. Fetching portable Node.js runtime..."
  NODE_VER="v22.14.0"
  ARCH=$(uname -m)
  case "$ARCH" in
    x86_64) NODE_ARCH="linux-x64" ;;
    aarch64|arm64) NODE_ARCH="linux-arm64" ;;
    *) echo "Unsupported architecture: $ARCH"; exit 1 ;;
  esac

  mkdir -p /tmp/node
  curl -fsSL "https://nodejs.org/dist/${NODE_VER}/node-${NODE_VER}-${NODE_ARCH}.tar.xz" | tar -xJ -C /tmp/node --strip-components=1
  export PATH="/tmp/node/bin:$PATH"
  echo "==> Portable Node.js $(node -v) and npm $(npm -v) installed successfully."
fi

echo "==> 2. Installing Frontend Node dependencies & building Vite React app..."
cd frontend
npm ci || npm install
npm run build
cd ..

echo "==> 3. Running automated test suite verification..."
export PYTHONPATH=".:backend"
python -m pytest backend/tests

echo "==> EthnoKG Platform successfully built and verified for deployment!"
