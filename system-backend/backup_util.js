const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const PDFDocument = require('pdfkit');
const os = require('os');

// Dynamic identification of running device details
const hostname = os.hostname() || 'UNKNOWN-DEVICE';
const username = os.userInfo ? os.userInfo().username : (process.env.USERNAME || 'User');
const DEVICE_NAME = hostname.toUpperCase();
const FULL_DEVICE_INFO = `${DEVICE_NAME} (User: ${username}, OS: ${os.type()} ${os.arch()})`;

// Resolve the Desktop path dynamically on Windows
let desktopPath = 'C:\\Users\\Alienware\\Desktop';
if (process.env.USERPROFILE) {
    desktopPath = path.join(process.env.USERPROFILE, 'Desktop');
}
const DESKTOP_BACKUP_ROOT = path.join(desktopPath, 'ARDMS file folder');
const LOCAL_BACKUP_ROOT = path.join(__dirname, '..', 'backup_data'); // Workspace local folder

/**
 * Perform a complete backup of all database entries, grouped by date.
 * Creates Excel-compatible CSVs and formatted PDFs for each active date.
 * @param {string} dbPath - Path to SQLite database
 */
function runSystemBackup(dbPath) {
    console.log(`[Backup] Triggering ARDMS system backup to dynamic Year/Month/Date/Device folders...`);

    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error('[Backup] Error opening database for backup:', err);
            return;
        }
    });

    db.serialize(() => {
        // Fetch all data
        const queries = {
            requests: "SELECT * FROM rescue_requests",
            commands: "SELECT * FROM command_queue",
            sos: "SELECT * FROM sos_alerts",
            users: "SELECT id, name, role, phone, serial_number, status FROM users"
        };

        let dbData = { requests: [], commands: [], sos: [], users: [] };
        let pending = Object.keys(queries).length;

        const checkDone = () => {
            pending--;
            if (pending === 0) {
                processBackupData(dbData);
                db.close();
            }
        };

        Object.keys(queries).forEach(key => {
            db.all(queries[key], (err, rows) => {
                if (err) {
                    console.error(`[Backup] Error querying ${key}:`, err);
                    dbData[key] = [];
                } else {
                    dbData[key] = rows || [];
                }
                checkDone();
            });
        });
    });
}

/**
 * Process fetched rows and group them by date
 */
function processBackupData(data) {
    const datesMap = new Set();
    const recordsByDate = {};

    // Helper to get date string YYYY-MM-DD from DATETIME
    const getDateString = (dateStr) => {
        if (!dateStr) return new Date().toISOString().split('T')[0];
        const clean = dateStr.split(' ')[0].split('T')[0];
        if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
            return clean;
        }
        return new Date().toISOString().split('T')[0];
    };

    // Initialize map
    const addRecord = (date, type, record) => {
        if (!recordsByDate[date]) {
            recordsByDate[date] = { requests: [], commands: [], sos: [] };
        }
        recordsByDate[date][type].push(record);
        datesMap.add(date);
    };

    // Group rescue requests
    data.requests.forEach(r => {
        const date = getDateString(r.created_at || r.updated_at);
        addRecord(date, 'requests', r);
    });

    // Group commands
    data.commands.forEach(c => {
        const date = getDateString(c.created_at || c.acknowledged_at);
        addRecord(date, 'commands', c);
    });

    // Group SOS Alerts
    data.sos.forEach(s => {
        const date = getDateString(s.timestamp);
        addRecord(date, 'sos', s);
    });

    // If database is empty, create at least today's folder
    const today = new Date().toISOString().split('T')[0];
    if (datesMap.size === 0) {
        datesMap.add(today);
        recordsByDate[today] = { requests: [], commands: [], sos: [] };
    }

    // Backup roots to write
    const backupRoots = [DESKTOP_BACKUP_ROOT, LOCAL_BACKUP_ROOT];

    // Write files for each date in both destinations
    datesMap.forEach(date => {
        const dateParts = date.split('-');
        const year = dateParts[0];
        const monthNum = dateParts[1];
        const day = dateParts[2];
        
        const monthNames = [
            "01-January", "02-February", "03-March", "04-April", "05-May", "06-June",
            "07-July", "08-August", "09-September", "10-October", "11-November", "12-December"
        ];
        const monthIdx = parseInt(monthNum, 10) - 1;
        const monthFolderName = (monthIdx >= 0 && monthIdx < 12) ? monthNames[monthIdx] : monthNum;

        backupRoots.forEach(root => {
            // Path structure: Root / Year / MonthFolderName / Day / DeviceName
            const dateFolder = path.join(root, year, monthFolderName, day, DEVICE_NAME);
            if (!fs.existsSync(dateFolder)) {
                fs.mkdirSync(dateFolder, { recursive: true });
            }

            const dateData = recordsByDate[date] || { requests: [], commands: [], sos: [] };

            // 1. Generate CSV file
            generateExcelCSV(dateFolder, date, dateData, data.users);

            // 2. Generate PDF file
            generatePDFReport(dateFolder, date, dateData, data.users);
        });
    });

    console.log(`[Backup] Completed successfully.`);
    console.log(`  -> Desktop Archive:   ${DESKTOP_BACKUP_ROOT}`);
    console.log(`  -> Workspace Archive: ${LOCAL_BACKUP_ROOT}`);
}

/**
 * Escape CSV field to prevent syntax breaks
 */
function escapeCSV(val) {
    if (val === null || val === undefined) return '';
    let str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        str = '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

/**
 * Generates an Excel-compatible CSV file for all task details of a specific date
 */
function generateExcelCSV(dateFolder, date, dateData, users) {
    const csvPath = path.join(dateFolder, `ARDMS_Task_Backup_${date}_${DEVICE_NAME}.csv`);
    const userMap = {};
    users.forEach(u => {
        userMap[u.id] = `${u.name} (${u.serial_number})`;
    });

    let content = '';

    // CSV Header info
    content += `ARDMS SYSTEM BACKUP REPORT - DATE: ${date}\n`;
    content += `Device Hostname: , ${DEVICE_NAME}\n`;
    content += `Device Info: , ${FULL_DEVICE_INFO}\n`;
    content += `Generated At: , ${new Date().toLocaleString()}\n\n`;

    // SECTION 1: Rescue Requests & Tasks
    content += `SECTION 1: RESCUE REQUESTS & TASKS\n`;
    content += `Request ID,Type,Urgency,Status,Latitude,Longitude,Details/Location,Assigned Responder,Created At,Updated At,Device Node\n`;
    if (dateData.requests.length === 0) {
        content += `NO ACTIVE REQUESTS FOR THIS DATE\n`;
    } else {
        dateData.requests.forEach(r => {
            const responder = r.assigned_user_id ? (userMap[r.assigned_user_id] || `User ID ${r.assigned_user_id}`) : 'Unassigned';
            content += `${r.id},${escapeCSV(r.type)},${escapeCSV(r.urgency)},${escapeCSV(r.status)},${r.lat},${r.lng},${escapeCSV(r.details)},${escapeCSV(responder)},${escapeCSV(r.created_at)},${escapeCSV(r.updated_at)},${DEVICE_NAME}\n`;
        });
    }
    content += `\n\n`;

    // SECTION 2: Rescuer Dispatches / Command Queue
    content += `SECTION 2: RESCUER COMMAND DISPATCHES\n`;
    content += `Command ID,Assigned Group ID,Target Phone,Payload Details,Type,Status,Created At,Acknowledged At,Device Node\n`;
    if (dateData.commands.length === 0) {
        content += `NO COMMANDS DISPATCHED FOR THIS DATE\n`;
    } else {
        dateData.commands.forEach(c => {
            content += `${c.id},${c.group_id || 'N/A'},${escapeCSV(c.target_phone)},${escapeCSV(c.command_payload)},${escapeCSV(c.command_type)},${escapeCSV(c.status)},${escapeCSV(c.created_at)},${escapeCSV(c.acknowledged_at)},${DEVICE_NAME}\n`;
        });
    }
    content += `\n\n`;

    // SECTION 3: Active SOS Alerts
    content += `SECTION 3: PUBLIC SOS ALERTS\n`;
    content += `SOS ID,Device ID,Phone,Latitude,Longitude,Details,Status,Priority,Alert Time,Device Node\n`;
    if (dateData.sos.length === 0) {
        content += `NO SOS ALERTS FOR THIS DATE\n`;
    } else {
        dateData.sos.forEach(s => {
            content += `${s.id},${escapeCSV(s.device_id)},${escapeCSV(s.phone)},${s.lat},${s.lng},${escapeCSV(s.details)},${escapeCSV(s.status)},${s.is_priority ? 'URGENT' : 'NORMAL'},${escapeCSV(s.timestamp)},${DEVICE_NAME}\n`;
        });
    }

    fs.writeFileSync(csvPath, content, 'utf8');
}

/**
 * Draws a professional, extremely compact grid data table inside the PDF to maximize page efficiency
 */
function drawPDFTable(doc, headers, widths, rows, headerBg = '#1e293b', textFontSize = 7) {
    const startX = 40;
    const headerHeight = 15;
    
    // Page break check for header
    if (doc.y > doc.page.height - 50) {
        doc.addPage().y = 40;
    }
    
    let currentY = doc.y;
    
    // Draw header background block
    doc.rect(startX, currentY, doc.page.width - 80, headerHeight).fillColor(headerBg).fill();
    
    // Draw header text and header borders
    let xOffset = startX;
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(textFontSize + 0.5);
    headers.forEach((header, idx) => {
        doc.text(String(header), xOffset + 4, currentY + 4, { width: widths[idx] - 8, align: 'left' });
        
        // Vertical grid lines for headers
        doc.moveTo(xOffset, currentY)
           .lineTo(xOffset, currentY + headerHeight)
           .strokeColor('#475569')
           .lineWidth(0.5)
           .stroke();
           
        xOffset += widths[idx];
    });
    // Draw outer right boundary line for headers
    doc.moveTo(xOffset, currentY)
       .lineTo(xOffset, currentY + headerHeight)
       .strokeColor('#475569')
       .lineWidth(0.5)
       .stroke();
    
    currentY += headerHeight;
    doc.y = currentY;
    
    if (rows.length === 0) {
        const emptyHeight = 14;
        doc.rect(startX, currentY, doc.page.width - 80, emptyHeight).fillColor('#f8fafc').fill();
        doc.fillColor('#64748b').font('Helvetica-Oblique').fontSize(7.5).text('No active records registered for this date.', startX + 10, currentY + 3);
        
        // Bottom boundary for empty state
        doc.moveTo(startX, currentY + emptyHeight)
           .lineTo(doc.page.width - 40, currentY + emptyHeight)
           .strokeColor('#cbd5e1')
           .lineWidth(0.5)
           .stroke();
           
        // Outer vertical left & right boundaries for empty state
        doc.moveTo(startX, currentY)
           .lineTo(startX, currentY + emptyHeight)
           .strokeColor('#cbd5e1')
           .lineWidth(0.5)
           .stroke();
        doc.moveTo(doc.page.width - 40, currentY)
           .lineTo(doc.page.width - 40, currentY + emptyHeight)
           .strokeColor('#cbd5e1')
           .lineWidth(0.5)
           .stroke();
           
        doc.y = currentY + emptyHeight + 10;
        return;
    }
    
    // Draw data rows
    rows.forEach((row, rowIndex) => {
        // Calculate dynamic height for this row based on text wrapping
        let maxHeight = 10;
        doc.font('Helvetica').fontSize(textFontSize);
        row.forEach((cell, idx) => {
            const cellHeight = doc.heightOfString(String(cell || ''), { width: widths[idx] - 8 });
            if (cellHeight > maxHeight) maxHeight = cellHeight;
        });
        
        const rowHeight = maxHeight + 4; // Extremely tight professional vertical padding (2pt top/bottom)
        
        // Page break check for row
        if (doc.y + rowHeight > doc.page.height - 40) {
            // Draw bottom border before jumping
            doc.moveTo(startX, currentY)
               .lineTo(doc.page.width - 40, currentY)
               .strokeColor('#cbd5e1')
               .lineWidth(0.5)
               .stroke();
               
            doc.addPage().y = 40;
            currentY = doc.y;
            
            // Re-draw header on new page
            doc.rect(startX, currentY, doc.page.width - 80, headerHeight).fillColor(headerBg).fill();
            let rx = startX;
            doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(textFontSize + 0.5);
            headers.forEach((hText, hIdx) => {
                doc.text(String(hText), rx + 4, currentY + 4, { width: widths[hIdx] - 8, align: 'left' });
                
                doc.moveTo(rx, currentY)
                   .lineTo(rx, currentY + headerHeight)
                   .strokeColor('#475569')
                   .lineWidth(0.5)
                   .stroke();
                   
                rx += widths[hIdx];
            });
            doc.moveTo(rx, currentY)
               .lineTo(rx, currentY + headerHeight)
               .strokeColor('#475569')
               .lineWidth(0.5)
               .stroke();
               
            currentY += headerHeight;
            doc.y = currentY;
        }
        
        // Alternating row background shading
        if (rowIndex % 2 === 1) {
            doc.rect(startX, currentY, doc.page.width - 80, rowHeight).fillColor('#f8fafc').fill();
        }
        
        // Draw row cells and detailed borders
        let rowX = startX;
        row.forEach((cell, idx) => {
            if (idx === 0) {
                doc.font('Helvetica-Bold').fillColor('#0f172a');
            } else if (idx === 2 || idx === 3) {
                // Urgency/Status dynamic professional formatting colors
                doc.font('Helvetica-Bold');
                const val = String(cell).toLowerCase();
                if (val === 'urgent' || val === 'critical' || val === 'critical emergency' || val === 'high') {
                    doc.fillColor('#b91c1c'); // Urgent Red
                } else if (val === 'completed' || val === 'closed') {
                    doc.fillColor('#15803d'); // Completed Green
                } else if (val === 'accepted' || val === 'active' || val === 'dispatched') {
                    doc.fillColor('#1d4ed8'); // Active Blue
                } else {
                    doc.fillColor('#334155');
                }
            } else {
                doc.font('Helvetica').fillColor('#334155');
            }
            
            // Draw wrapped cell text with 2pt top padding
            doc.text(String(cell || ''), rowX + 4, currentY + 2, { width: widths[idx] - 8, align: 'left' });
            
            // Draw internal vertical grid cell line
            doc.moveTo(rowX, currentY)
               .lineTo(rowX, currentY + rowHeight)
               .strokeColor('#cbd5e1')
               .lineWidth(0.5)
               .stroke();
               
            rowX += widths[idx];
        });
        
        // Draw far right outer boundary line
        doc.moveTo(rowX, currentY)
           .lineTo(rowX, currentY + rowHeight)
           .strokeColor('#cbd5e1')
           .lineWidth(0.5)
           .stroke();
        
        // Draw thin horizontal grid row separator
        doc.moveTo(startX, currentY + rowHeight)
           .lineTo(doc.page.width - 40, currentY + rowHeight)
           .strokeColor('#cbd5e1')
           .lineWidth(0.5)
           .stroke();
        
        currentY += rowHeight;
        doc.y = currentY;
    });
    
    doc.y = currentY + 10;
}

/**
 * Generates a professionally typeset PDF using PDFKit with highly optimized row densities
 */
function generatePDFReport(dateFolder, date, dateData, users) {
    const pdfPath = path.join(dateFolder, `ARDMS_Tactical_Report_${date}_${DEVICE_NAME}.pdf`);
    const doc = new PDFDocument({ margin: 40, size: 'A4', bufferPages: true });
    
    const userMap = {};
    users.forEach(u => {
        userMap[u.id] = `${u.name} (${u.serial_number})`;
    });

    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);

    // --- High-contrast Professional Header Banner ---
    doc.rect(0, 0, doc.page.width, 100).fill('#1e293b');
    doc.fillColor('#ffffff')
       .fontSize(20)
       .font('Helvetica-Bold')
       .text('ARDMS EMERGENCY RESCUE SYSTEM', 40, 25);
    doc.fontSize(11)
       .font('Helvetica')
       .text(`DAILY TACTICAL OPERATIONS REPORT - ${date}`, 40, 52);
    doc.fontSize(8.5)
       .fillColor('#cbd5e1')
       .text(`Device: ${FULL_DEVICE_INFO} | Generated: ${new Date().toLocaleString()}`, 40, 72);

    doc.y = 115;
    doc.fillColor('#1e293b');

    // --- Section 1: Active Rescue Requests & Tasks ---
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a').text('1. ACTIVE RESCUE REQUESTS & TASKS');
    doc.moveTo(40, doc.y + 4).lineTo(doc.page.width - 40, doc.y + 4).strokeColor('#cbd5e1').lineWidth(0.75).stroke();
    doc.y += 8;

    const reqHeaders = ['ID', 'Type', 'Urgency', 'Status', 'Coordinates', 'Assigned Responder', 'Details / Location Notes'];
    const reqWidths = [25, 65, 50, 50, 85, 90, 150]; // Total: 515
    const reqRows = [];
    dateData.requests.forEach(r => {
        const responder = r.assigned_user_id ? (userMap[r.assigned_user_id] || `Res-${r.assigned_user_id}`) : 'Unassigned';
        const coords = `${r.lat.toFixed(5)}, ${r.lng.toFixed(5)}`;
        reqRows.push([
            `#${r.id}`,
            r.type || 'N/A',
            r.urgency || 'N/A',
            r.status || 'N/A',
            coords,
            responder,
            r.details || 'No details provided'
        ]);
    });

    drawPDFTable(doc, reqHeaders, reqWidths, reqRows, '#1e293b', 7);

    // --- Section 2: Rescuer Dispatches / Command Queue ---
    if (doc.y > doc.page.height - 70) doc.addPage().y = 40;
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a').text('2. RESCUER DISPATCH LOGS');
    doc.moveTo(40, doc.y + 4).lineTo(doc.page.width - 40, doc.y + 4).strokeColor('#cbd5e1').lineWidth(0.75).stroke();
    doc.y += 8;

    const cmdHeaders = ['CMD ID', 'Group ID', 'Target Phone', 'Command Type', 'Payload / Message Details', 'Status', 'Dispatch Time'];
    const cmdWidths = [45, 45, 75, 70, 160, 55, 65]; // Total: 515
    const cmdRows = [];
    dateData.commands.forEach(c => {
        const timePart = c.created_at ? (c.created_at.includes(' ') ? c.created_at.split(' ')[1] : c.created_at) : 'N/A';
        cmdRows.push([
            `CMD-${c.id}`,
            c.group_id ? `Grp ${c.group_id}` : 'All',
            c.target_phone || 'N/A',
            c.command_type || 'N/A',
            c.command_payload || 'N/A',
            c.status || 'N/A',
            timePart
        ]);
    });

    drawPDFTable(doc, cmdHeaders, cmdWidths, cmdRows, '#334155', 7);

    // --- Section 3: Active Public SOS Alerts ---
    if (doc.y > doc.page.height - 70) doc.addPage().y = 40;
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a').text('3. CITIZEN SOS ALERTS');
    doc.moveTo(40, doc.y + 4).lineTo(doc.page.width - 40, doc.y + 4).strokeColor('#cbd5e1').lineWidth(0.75).stroke();
    doc.y += 8;

    const sosHeaders = ['SOS ID', 'Phone Number', 'Coordinates', 'Priority', 'Status', 'Emergency Alert Details', 'Alert Time'];
    const sosWidths = [40, 75, 85, 60, 50, 135, 70]; // Total: 515
    const sosRows = [];
    dateData.sos.forEach(s => {
        const coords = `${s.lat.toFixed(5)}, ${s.lng.toFixed(5)}`;
        const timePart = s.timestamp ? (s.timestamp.includes(' ') ? s.timestamp.split(' ')[1] : s.timestamp) : 'N/A';
        sosRows.push([
            `SOS-${s.id}`,
            s.phone || 'Unknown',
            coords,
            s.is_priority ? 'URGENT' : 'NORMAL',
            s.status || 'N/A',
            s.details || 'Priority alert triggered.',
            timePart
        ]);
    });

    drawPDFTable(doc, sosHeaders, sosWidths, sosRows, '#7f1d1d', 7);

    // --- Dynamic Professional Footer Page Numbers ---
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(7.5).fillColor('#64748b').text(
            `Page ${i + 1} of ${pages.count} | Device: ${DEVICE_NAME} | ARDMS Secure Operations Backup`,
            40,
            doc.page.height - 25,
            { align: 'center', width: doc.page.width - 80 }
        );
    }

    doc.end();
}

module.exports = {
    runSystemBackup
};
