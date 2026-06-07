# 🛡️ ARDMS Emergency Rescue Suite - Professional Production Deployment Guide

This guide details the **Production Model** configuration for the **ARDMS Emergency Suite**, including process daemonization, database reliability, WebSocket gateways, local network syncing, and Android APK deployment.

---

## 🏗️ 1. Professional Process Daemonization (PM2)
In production, running Node.js with raw `node server.js` is highly vulnerable to crashes and system reboots. To ensure **99.9% High Availability**, we use **PM2 (Process Manager 2)**.

### Installation
Install PM2 globally on the host computer:
```powershell
npm install -g pm2
```

### Start Backend in Production
Start the ARDMS server as a managed background service:
```powershell
cd "c:\Users\Alienware\Desktop\Rescue Backup 26-04-2026\system-backend"
pm2 start server.js --name "ardms-backend" --watch
```
*The `--watch` option enables automatic zero-downtime hot-reloads whenever files or configuration properties change.*

### Auto-Boot on System Restart
Configure PM2 to automatically launch the ARDMS service when the laptop boots:
```powershell
pm2 startup
pm2 save
```

### Essential PM2 Commands for HQ Command Center
* **View Live Dashboard & Health Metrics**: `pm2 monit`
* **Check Process List & Status**: `pm2 list`
* **Inspect Real-time System Logs**: `pm2 logs`
* **Restart Service**: `pm2 restart ardms-backend`
* **Stop Service**: `pm2 stop ardms-backend`

---

## 🗄️ 2. SQLite Production Optimizations (WAL & Indexes)
The SQLite database (`rescue.db`) has been optimized to handle concurrent requests from hundreds of citizen apps and rescuer devices without locking:

1. **Write-Ahead Logging (WAL) Mode**: Enabled via `PRAGMA journal_mode=WAL;`. This splits read and write transactions into separate virtual streams, allowing rescuers to query tasks while citizens are actively filing SOS alerts simultaneously.
2. **Synchronous normality**: Configured via `PRAGMA synchronous=NORMAL;`. This reduces Disk I/O bottlenecks while maintaining strict ACID compliance.
3. **Database Indexing**: Automatic database indexes are created on start to ensure O(1) query lookup times:
   * `idx_rescue_requests_status` for Leaflet map filtering.
   * `idx_rescue_requests_phone` for public status lookups.
   * `idx_command_queue_status` for active dispatch logs.
   * `idx_sos_alerts_status` for real-time SOS feeds.
   * `idx_rescuer_locations_group` for group tactical perimeter overlays.
   * `idx_notifications_device_read` for push notification synchronization.

---

## 🔄 3. Dynamic Date-Stamped Backups (Resilience Engine)
To safeguard critical operation files in high-stakes environments, the **ARDMS Backup Engine** runs in the background.

### Backup Strategy
* **Triggers**: Executed automatically on **server startup** and dynamically whenever a critical transaction occurs:
  * Creating a new SOS Alert
  * Creating a new Rescue Request
  * Assigning/Accepting a mission
  * Updating a task location or status
  * Reassigning dispatch personnel
* **Output Folder**: `C:\Users\Alienware\Desktop\ARDMS file folder\YYYY-MM-DD\`
* **Generated Formats**:
  1. **Excel-Compatible CSV**: `ARDMS_Task_Backup_YYYY-MM-DD.csv` — Full operational dataset split into 3 clear tactical sections (Tasks, Commands, Public SOS Alerts) with proper string-escaping to prevent formatting breaks.
  2. **Professionally Typeset PDF**: `ARDMS_Tactical_Report_YYYY-MM-DD.pdf` — Features a high-contrast dark navy banner, clean tables, grid coordinate layouts, responder maps details, and dynamic `Page X of Y` footers.

> [!IMPORTANT]
> **Crash Recovery Protocol**: If the host laptop experiences a critical operating system crash or hardware failure, the system installer can copy the generated `.csv` and `.pdf` files from the desktop's `ARDMS file folder` directly into the project deployment folder to restore and audit all missions instantly.

---

## ⚡ 4. Real-time WebSocket Gateway & Heartbeat
The backend uses **WebSockets (`ws` protocol)** on port `3001` for instantaneous, bi-directional client communication.

* **Heartbeat Protocol**: PING/PONG messages occur every few seconds to purge dead connections and maintain low network latency.
* **Offline Message Queueing**: If a Rescuer goes offline in a remote region, any incoming command from HQ is queued in memory. The moment the Rescuer re-enters network range, the registering handshake triggers an immediate queue flush, pushing all accumulated tasks.

---

## 📡 5. Local Wi-Fi Network Sync (`sync_apps.py`)
To test the systems on actual physical smartphones or emulators over local Wi-Fi without manual file edits, we provide a central synchronizer.

### How to Synchronize
Simply run the script in the root directory:
```powershell
python sync_apps.py
```
This script:
1. Dynamically detects the active local LAN IP (e.g., `192.168.1.5`) of the laptop.
2. Replaces all instances of `localhost`, `127.0.0.1`, and older IPs in all preview pages and React Native configurations.
3. Compiles the modern HTML5 files as optimized, escaped JSON strings inside `rescuer-app/htmlStr.js` and `public-sos-app/htmlStr.js`.
4. Updates the React Native `App.js` API base URLs to route queries to the host machine.

---

## 📱 6. Android APK Rebuild Process (Expo Application Services)
The suite includes pre-compiled production-grade APKs directly inside `APKs/`:
* `public-sos-app-release.apk`
* `rescuer-app-release.apk`

Should you make code changes and need to rebuild these APKs locally:

### Prerequisites
Install Expo and React Native CLI tools:
```powershell
npm install -g eas-cli
```

### Steps to Compile
1. **Initialize Expo Account**: Run `eas login` to link your developer portal.
2. **Apply Kotlin Gradle overrides**: Run `python patch_rn.py` and `python patch_expo.py` to automatically configure Gradle modules for offline compiles.
3. **Build APK Command**:
   - **For Rescuer Officer App**:
     ```powershell
     cd rescuer-app
     eas build -p android --profile production --local
     ```
   - **For Public Citizen App**:
     ```powershell
     cd public-sos-app
     eas build -p android --profile production --local
     ```

---

*System engineered professionally under ARDMS Standards • Version 3.5.0*
