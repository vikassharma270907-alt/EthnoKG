#!/usr/bin/env bash
# Render Unified Build Script for EthnoKG
set -o errexit

echo "==> 1. Installing Python dependencies..."
pip install -r backend/requirements.txt

echo "==> 2. Installing Frontend Node dependencies & building Vite React app..."
cd frontend
npm install
npm run build
cd ..

echo "==> 3. Running automated test suite verification..."
python -m pytest backend/tests

echo "==> EthnoKG Platform successfully built and verified for deployment!"
