const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Paths to save
const workspaceRoot = 'c:\\Users\\Alienware\\Desktop\\Rescue Backup 26-04-2026';
const desktopBackupRoot = 'C:\\Users\\Alienware\\Desktop\\ARDMS file folder';

const pdfWorkspacePath = path.join(workspaceRoot, 'TECH_STACK.pdf');
const pdfDesktopPath = path.join(desktopBackupRoot, 'TECH_STACK.pdf');

function generateTechStackPDF() {
    console.log('[Tech Stack PDF] Generating professional, non-overlapping Tech Stack Specification...');

    // Auto-create Desktop backup folder if missing
    if (!fs.existsSync(desktopBackupRoot)) {
        try {
            fs.mkdirSync(desktopBackupRoot, { recursive: true });
            console.log('[Tech Stack PDF] Created Desktop backup folder: ' + desktopBackupRoot);
        } catch (e) {
            console.error('[Tech Stack PDF] Could not create Desktop folder: ' + e.message);
        }
    }

    const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });

    // Global layout helper for headers
    const addPageHeader = (titleText, subtitleText) => {
        doc.rect(0, 0, doc.page.width, 110).fill('#0f172a');
        doc.fillColor('#ffffff')
           .fontSize(20)
           .font('Helvetica-Bold')
           .text('ARDMS EMERGENCY RESCUE SYSTEM', 50, 30);
        doc.fontSize(10.5)
           .font('Helvetica')
           .text(titleText, 50, 58);
        doc.fontSize(8.5)
           .font('Helvetica-Oblique')
           .fillColor('#94a3b8')
           .text(subtitleText, 50, 78);
        doc.y = 135;
        doc.x = 50; // Reset drawing cursor x to left margin
        doc.lineGap(3);
    };

    const addSectionHeader = (title) => {
        doc.moveDown(0.8);
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#0f172a').text(title);
        const currentY = doc.y;
        doc.moveTo(50, currentY + 2).lineTo(doc.page.width - 50, currentY + 2).strokeColor('#e2e8f0').stroke();
        doc.y = currentY + 10;
        doc.x = 50; // Ensure margins are restored
    };

    const drawBullet = (label, desc) => {
        doc.x = 65;
        doc.fillColor('#2563eb').font('Helvetica-Bold').fontSize(10).text('• ', { continued: true });
        doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(9.5).text(label + ' ', { continued: true });
        doc.fillColor('#334155').font('Helvetica').fontSize(9.5).text(desc, { lineGap: 2 });
        doc.x = 50; // Restore margin
        doc.moveDown(0.3);
    };

    const stepBullet = (num, title, text) => {
        doc.x = 65;
        doc.fillColor('#2563eb').font('Helvetica-Bold').fontSize(10).text(num + '. ', { continued: true });
        doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(9.5).text(title + ' ', { continued: true });
        doc.fillColor('#334155').font('Helvetica').fontSize(9.5).text(text, { align: 'justify', lineGap: 2 });
        doc.x = 50; // Restore margin
        doc.moveDown(0.4);
    };

    // ==========================================
    // PAGE 1: ARCHITECTURE & BACKEND/WEB SPEC
    // ==========================================
    addPageHeader('SYSTEM TECHNOLOGY STACK & ARCHITECTURE SPECIFICATION', 'Technical Documentation | Production Release v3.5.0');

    addSectionHeader('1. SYSTEM ARCHITECTURE & INTEGRATION');
    doc.fontSize(9.5).font('Helvetica').fillColor('#334155')
       .text('The ARDMS Emergency Rescue Suite is an enterprise-grade tactical coordinator designed to operate reliably in high-stakes environments. The system utilizes a distributed, real-time client-server architecture. All mission components (HQ Web Command Center, Rescue Officer App, and Public SOS System) communicate over bidirectional WebSocket channels and REST APIs to synchronize maps, coordinates, dispatches, and status states with sub-second latencies.', { align: 'justify' });
    doc.moveDown(0.5);

    addSectionHeader('2. BACKEND ARCHITECTURE & SERVER STACK');
    
    // Draw background card for backend
    const cardY = doc.y;
    const cardHeight = 152;
    doc.rect(50, cardY, doc.page.width - 100, cardHeight).fillColor('#f8fafc').fill();
    doc.rect(50, cardY, 4, cardHeight).fillColor('#2563eb').fill(); // Elegant blue left border bar
    doc.y = cardY + 12;
    
    doc.fillColor('#0f172a').fontSize(10.5).font('Helvetica-Bold').text('Core Stack & Technologies:', 65);
    doc.moveDown(0.4);

    drawBullet('Runtime:', 'Node.js LTS (High Performance Async I/O)');
    drawBullet('Framework:', 'Express.js v5 (Robust REST API Routing)');
    drawBullet('Database:', 'SQLite3 with Write-Ahead Logging (WAL) Mode Enabled');
    drawBullet('Real-time:', 'WebSockets (ws protocol) on Port 3001 with Auto-Heartbeat');
    drawBullet('Security:', 'JSON Web Tokens (JWT) + Cryptographic Salted bcryptjs');
    drawBullet('Management:', 'PM2 Process Daemonization with Zero-Downtime Auto-Restart');

    doc.y = cardY + cardHeight + 15; // Dynamic vertical jump after card
    doc.x = 50;

    addSectionHeader('3. ARDMS WEB COMMAND CENTER');
    doc.fontSize(9.5).font('Helvetica').fillColor('#334155')
       .text('The primary interface for operational command and control is a highly polished, responsive single-page web dashboard designed with modern glassmorphic aesthetics. Features include:', { align: 'justify' });
    doc.moveDown(0.5);

    drawBullet('Core Client UI:', 'HTML5, Modern Vanilla CSS (Sleek dark panel aesthetics)');
    drawBullet('Maps Engine:', 'Leaflet.js API (Marker clustering, dynamic tactical routing)');
    drawBullet('Pulsing Polyline:', 'Dynamic drawing connecting Officer & SOS coordinates');
    drawBullet('Group Boundaries:', 'Dashed blue polygons representing squad perimeter limits');
    drawBullet('Digital Clock:', 'Real-time AM/PM ticking digital clock inside the navbar');

    // ==========================================
    // PAGE 2: MOBILE & CONNECTIVITY GATEWAY
    // ==========================================
    doc.addPage();
    addPageHeader('MOBILE ARCHITECTURE & REAL-TIME CONNECTIVITY GATEWAY', 'Section 4 & 5 | Operational Synchronization Ledger');

    addSectionHeader('4. MOBILE APPLICATION ARCHITECTURES');
    doc.fontSize(9.5).font('Helvetica').fillColor('#334155')
       .text('Both mobile applications are engineered using React Native (bare Expo workflows) to deliver near-native performance, offline resilience, and fast compile speeds:');
    doc.moveDown(0.5);

    doc.x = 60;
    doc.fillColor('#0f172a').fontSize(10.5).font('Helvetica-Bold').text('ARDMS-Rescue Officer App:');
    doc.x = 75;
    doc.moveDown(0.2);
    doc.fontSize(9.5).font('Helvetica').fillColor('#334155')
       .text('• Platform: React Native (Bare Expo SDK 54) with custom WebView wrapper.\n• Live Telemetry: Tracks coordinates in real-time, streaming locations to HQ.\n• Group Polygons: Displays group boundary limits on offline-capable Leaflet maps.', { lineGap: 3 });
    doc.x = 50;
    doc.moveDown(0.6);

    doc.x = 60;
    doc.fillColor('#0f172a').fontSize(10.5).font('Helvetica-Bold').text('ARDMS-Public Support System:');
    doc.x = 75;
    doc.moveDown(0.2);
    doc.fontSize(9.5).font('Helvetica').fillColor('#334155')
       .text('• Platform: React Native WebView wrapper for public submissions.\n• Location Fetching: Automatically resolves exact GPS coordinates on launch.\n• Quick SOS: Actionable panic buttons for immediate grid dispatching.', { lineGap: 3 });
    doc.x = 50;
    doc.moveDown(0.8);

    addSectionHeader('5. REAL-TIME GATEWAY & RECONNECT TECHNOLOGY');
    doc.fontSize(9.5).font('Helvetica').fillColor('#334155')
       .text('To safeguard operation data in low-reception zones, the ARDMS connection gateway utilizes specialized sync and reconnection architectures:', { align: 'justify' });
    doc.moveDown(0.5);

    drawBullet('Socket Handshake (REGISTER):', 'Clients segregate into specific channels by transmitting a \"REGISTER\" message packet upon websocket connection (e.g. room: \"rescuers\" or \"admin\").');
    drawBullet('Active Heartbeats (PING/PONG):', 'A bidirectional keep-alive timer sends PING frames from server to clients every 15 seconds. If a client fails to reply with PONG within 5 seconds, the server terminates the socket to free resources.');
    drawBullet('Offline Telemetry Buffer:', 'If reception drops, client coordinates and actions queue up locally. On the backend, pending task assignments and dispatches are serialized and buffered in memory.');
    drawBullet('Auto-Flush Sync Queue:', 'The instant a disconnected client registers back online, the gateway identifies the client, restores the session, and automatically flushes the queue.');
    drawBullet('Out-of-Band State Pulling:', 'Frontends initiate a silent HTTPS API pull upon socket reconnection to refresh Leaflet maps and sync local states with the database.');

    // ==========================================
    // PAGE 3: WINDOWS LOCALHOST & PRIVATE DEVICE TESTING
    // ==========================================
    doc.addPage();
    addPageHeader('WINDOWS HOST & PRIVATE DEVICE TESTING GUIDE', 'Section 6 | Step-by-Step Local Wi-Fi Synchronization');

    addSectionHeader('6. WINDOWS HOST & PRIVATE DEVICE TESTING GUIDE');
    doc.fontSize(9.5).font('Helvetica').fillColor('#334155')
       .text('To run local testing on physical smartphones and private devices over local Wi-Fi, execute the following step-by-step Windows deployment guide:', { align: 'justify' });
    doc.moveDown(0.6);

    doc.x = 60;
    doc.fillColor('#0f172a').fontSize(10.5).font('Helvetica-Bold').text('Prerequisite Setup (Windows Host Firewall):');
    doc.x = 75;
    doc.moveDown(0.2);
    doc.fontSize(9.5).font('Helvetica').fillColor('#334155')
       .text('Before physical mobile devices can connect to the Windows machine, local port traffic must be allowed through the Windows Defender Firewall. Run the provided Fix_Firewall.bat as Administrator. This adds two inbound netsh rules: one for TCP Port 3001 and one allowing node.exe through the system firewall.', { align: 'justify', lineGap: 3 });
    doc.x = 50;
    doc.moveDown(0.6);

    doc.x = 60;
    doc.fillColor('#0f172a').fontSize(10.5).font('Helvetica-Bold').text('Step-by-Step Localhost & Mobile Synchronization:');
    doc.x = 50;
    doc.moveDown(0.4);

    stepBullet('1', 'Establish Shared Wi-Fi:', 'Connect both your host Windows laptop and your private mobile device (Android/iOS) to the exact same local Wi-Fi network.');
    stepBullet('2', 'Execute Auto-Synchronizer:', 'Run \"python sync_apps.py\" in the workspace root. The script auto-resolves your active Windows LAN IP (e.g., 192.168.1.5), patches it across all HTML previews and App.js configurations, and compiles WebViews.');
    stepBullet('3', 'Launch Server with PM2:', 'Start the Express backend under process monitoring: inside \"system-backend/\", run \"pm2 start server.js --name \"ardms-backend\" --watch\" in powershell.');
    stepBullet('4', 'Deploy APK on Mobile Device:', 'Copy and install the pre-compiled APK file (\"public-sos-app-release.apk\" or \"rescuer-app-release.apk\" inside \"/APKs\") to your private Android handset.');
    stepBullet('5', 'Open App and Verify:', 'Launch the application on your phone. It will immediately connect to your laptop\'s LAN IP, syncing live coordinates, markers, maps, and commands instantly!');

    // --- Footer page numbers ---
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).fillColor('#94a3b8').text(
            `Page ${i + 1} of ${pages.count} | ARDMS Technical Specification & Sync Guide`,
            50,
            doc.page.height - 30,
            { align: 'center', width: doc.page.width - 100 }
        );
    }

    // Write files
    const writeStreamWorkspace = fs.createWriteStream(pdfWorkspacePath);
    doc.pipe(writeStreamWorkspace);

    if (fs.existsSync(desktopBackupRoot)) {
        const writeStreamDesktop = fs.createWriteStream(pdfDesktopPath);
        doc.pipe(writeStreamDesktop);
    }

    doc.end();
    console.log(`[Tech Stack PDF] Clean, non-overlapping PDF successfully generated at: ${pdfWorkspacePath}`);
}

generateTechStackPDF();

