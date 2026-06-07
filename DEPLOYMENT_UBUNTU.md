# AntiGravity Ubuntu Deployment Guide

## Overview
This system has been configured to run entirely on an Ubuntu LTS Local Network Environment. All Windows-specific dependencies have been removed. The system handles IP assignment and server discovery dynamically.

## Prerequisites
- **Ubuntu 20.04 LTS** or newer.
- **Node.js** (v18 or newer recommended).
- **npm** package manager.
- **UFW** (Uncomplicated Firewall) for managing ports (optional but recommended).

## Deployment Steps
1. **Clone the repository:**
   ```bash
   git clone https://github.com/rkopenone-alt/My-Network-System-UBUNTU.git
   cd My-Network-System-UBUNTU
   ```

2. **Configure the Firewall (Optional):**
   ```bash
   chmod +x ./ubuntu_firewall.sh
   ./ubuntu_firewall.sh
   ```

3. **Launch the System:**
   You can start the entire system with a single command. It will dynamically resolve your network IP, start the backend API, and open the Web Admin dashboard.
   ```bash
   chmod +x ./run_antigravity.sh
   ./run_antigravity.sh
   ```

## Dynamic IP Management
- The `run_antigravity.sh` script automatically detects your active network interface (Ethernet or WiFi) and binds the Node.js backend.
- The Web Admin interface dynamically detects the gateway on load.
- If you need to manually override the IP Address (e.g. if the system is hosted on a specific VLAN or remote interface), you can do so in the Web Admin UI under **Server Connection IP Configuration**. A validation system ensures the IP is reachable before applying it.

## Troubleshooting
- If the port is busy, `run_antigravity.sh` will automatically attempt to free port 3001.
- If the browser fails to open, manually open `system-backend/public/Web ADMIN.html` in Chrome/Firefox.
