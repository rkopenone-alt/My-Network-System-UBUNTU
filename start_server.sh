#!/bin/bash
echo "[SERVER] Checking dependencies..."
cd system-backend || exit 1

if [ ! -d "node_modules" ]; then
    echo "[SERVER] node_modules not found. Installing..."
    npm install
fi

echo "[SERVER] Starting AntiGravity Backend..."
node server.js
