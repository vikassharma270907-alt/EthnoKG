#!/usr/bin/env bash
# Render Unified Build Script for EthnoKG
set -o errexit

echo "==> 1. Installing Python dependencies..."
pip install -r backend/requirements.txt

# Ensure Node.js and npm are available (handles native Python environments)
if ! command -v npm &> /dev/null; then
  echo "==> Node.js/npm not detected in native environment. Fetching portable Node.js runtime..."
  NODE_VER="v20.18.0"
  mkdir -p /tmp/node
  curl -sL "https://nodejs.org/dist/${NODE_VER}/node-${NODE_VER}-linux-x64.tar.xz" | tar -xJ -C /tmp/node --strip-components=1
  export PATH="/tmp/node/bin:$PATH"
  echo "==> Portable Node.js $(node -v) and npm $(npm -v) installed successfully."
fi

echo "==> 2. Installing Frontend Node dependencies & building Vite React app..."
cd frontend
npm install
npm run build
cd ..

echo "==> 3. Running automated test suite verification..."
export PYTHONPATH=".:backend"
python -m pytest backend/tests

echo "==> EthnoKG Platform successfully built and verified for deployment!"
