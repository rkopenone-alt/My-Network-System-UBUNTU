#!/bin/bash
echo "========================================="
echo "   AntiGravity Firewall Configuration    "
echo "========================================="
echo "Configuring UFW to allow port 3001 for Local Network access..."

if command -v ufw >/dev/null 2>&1; then
    sudo ufw allow 3001/tcp
    echo "=> Port 3001 opened successfully."
    sudo ufw reload
    echo "=> Firewall rules reloaded."
else
    echo "[!] UFW is not installed. Please configure your firewall manually to allow port 3001."
fi
