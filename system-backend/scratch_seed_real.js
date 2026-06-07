const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'rescue.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
        process.exit(1);
    }
});

db.serialize(() => {
    console.log('Clearing old entries for fresh dynamic testing...');
    db.run('DELETE FROM rescue_requests');
    db.run('DELETE FROM command_queue');
    db.run('DELETE FROM sos_alerts');

    console.log('Inserting realistic Rescue Requests & Tasks...');
    const reqs = [
        {
            device_id: 'DEV-101',
            phone: '918000000001',
            type: 'Evacuation',
            lat: 12.97159,
            lng: 77.59456,
            details: '4 elderly citizens trapped on waterlogged first-floor balcony near Sector A.',
            status: 'accepted',
            urgency: 'critical',
            assigned_user_id: 1, // Arjun Singh
            assigned_group_id: 1
        },
        {
            device_id: 'DEV-102',
            phone: '918000000002',
            type: 'Medical',
            lat: 12.97230,
            lng: 77.59512,
            details: 'Diabetic resident requires urgent insulin supply delivery and checkup.',
            status: 'completed',
            urgency: 'urgent',
            assigned_user_id: 2, // Sarah Khan
            assigned_group_id: 3
        },
        {
            device_id: 'DEV-103',
            phone: '918000000003',
            type: 'Food Supply',
            lat: 12.97085,
            lng: 77.59388,
            details: '15 families in community hall requiring raw material rations and drinking water.',
            status: 'pending',
            urgency: 'normal',
            assigned_user_id: null,
            assigned_group_id: 2
        },
        {
            device_id: 'DEV-104',
            phone: '918000000004',
            type: 'Rescue',
            lat: 12.97311,
            lng: 77.59604,
            details: 'Collapsed compound brick wall trapping access road to emergency vehicles.',
            status: 'active',
            urgency: 'high',
            assigned_user_id: 4, // Vikram Rao
            assigned_group_id: 1
        }
    ];

    const reqStmt = db.prepare(`
        INSERT INTO rescue_requests 
        (device_id, phone, type, lat, lng, details, status, urgency, assigned_user_id, assigned_group_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-30 minutes'), datetime('now'))
    `);
    reqs.forEach(r => {
        reqStmt.run(r.device_id, r.phone, r.type, r.lat, r.lng, r.details, r.status, r.urgency, r.assigned_user_id, r.assigned_group_id);
    });
    reqStmt.finalize();

    console.log('Inserting realistic Rescuer Command Queue dispatches...');
    const cmds = [
        {
            group_id: 1,
            target_phone: '919000000001',
            command_payload: 'Deploy immediate water evacuation unit to coordinates 12.97159, 77.59456 (Sector A).',
            command_type: 'zone',
            status: 'accepted'
        },
        {
            group_id: 3,
            target_phone: '919000000002',
            command_payload: 'Deliver critical medical box to safe shelter building near Sector B.',
            command_type: 'medical',
            status: 'completed'
        },
        {
            group_id: 2,
            target_phone: '919000000005',
            command_payload: 'Deliver dry food ration containers to central school distribution station.',
            command_type: 'supply',
            status: 'pending'
        }
    ];

    const cmdStmt = db.prepare(`
        INSERT INTO command_queue
        (group_id, target_phone, command_payload, command_type, status, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now', '-45 minutes'))
    `);
    cmds.forEach(c => {
        cmdStmt.run(c.group_id, c.target_phone, c.command_payload, c.command_type, c.status);
    });
    cmdStmt.finalize();

    console.log('Inserting realistic Public SOS Alerts...');
    const sos = [
        {
            device_id: 'SOS-DEVICE-X',
            phone: '918000000001',
            lat: 12.97159,
            lng: 77.59456,
            details: 'SOS button pressed. Severe flooding inside ground level. Assistance required.',
            status: 'active',
            is_priority: 1
        },
        {
            device_id: 'SOS-DEVICE-Y',
            phone: '918000000002',
            lat: 12.97230,
            lng: 77.59512,
            details: 'Fever medicine needed. Elderly lady suffering from breathing issues.',
            status: 'resolved',
            is_priority: 1
        },
        {
            device_id: 'SOS-DEVICE-Z',
            phone: '918000000003',
            lat: 12.97085,
            lng: 77.59388,
            details: 'Road fully blocked. Need clearing assistance.',
            status: 'active',
            is_priority: 0
        }
    ];

    const sosStmt = db.prepare(`
        INSERT INTO sos_alerts
        (device_id, phone, lat, lng, details, status, is_priority, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', '-15 minutes'))
    `);
    sos.forEach(s => {
        sosStmt.run(s.device_id, s.phone, s.lat, s.lng, s.details, s.status, s.is_priority);
    });
    sosStmt.finalize();

    console.log('Successfully completed seeding active production tables in rescue.db!');
    db.close();
});
