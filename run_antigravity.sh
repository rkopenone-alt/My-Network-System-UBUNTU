#!/bin/bash
# Master Launcher for AntiGravity System on Ubuntu

echo "========================================="
echo "   AntiGravity Production Launcher      "
echo "========================================="

echo "[*] Resolving dynamic local IP address..."
SERVER_IP=$(hostname -I | awk '{print $1}')
if [ -z "$SERVER_IP" ]; then
    SERVER_IP="127.0.0.1"
fi
echo "=> Detected Primary Gateway IP: $SERVER_IP"
echo ""

echo "[*] Checking for port 3001 conflicts..."
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "[!] Port 3001 is currently in use. Attempting to clear existing server..."
    kill -9 $(lsof -t -i:3001)
    echo "=> Existing server killed."
    sleep 2
fi

echo "[*] Starting Backend Services..."
chmod +x ./start_server.sh
./start_server.sh &
SERVER_PID=$!

echo "=> Backend started with PID: $SERVER_PID"
echo "[*] Waiting for backend to initialize..."
sleep 4

echo "[*] Launching Web Admin..."
chmod +x ./start_admin.sh
./start_admin.sh

echo "========================================="
echo "   System is currently running online.  "
echo "   Access via Web Admin or Android App. "
echo "   Server API Address: http://$SERVER_IP:3001/api "
echo "========================================="

wait $SERVER_PID
