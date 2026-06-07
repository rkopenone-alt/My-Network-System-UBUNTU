const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'rescue.db');
const db = new sqlite3.Database(dbPath);

const dummyGroups = [
    { name: 'Alpha Squad', role: 'rescue', desc: 'Primary fast response team' },
    { name: 'Bravo Medics', role: 'medical', desc: 'Specialized medical support' },
    { name: 'Delta Rescuers', role: 'rescue', desc: 'Heavy equipment and structural rescue' },
    { name: 'Echo Logistics', role: 'support', desc: 'Supply chain and transport' }
];

const dummyUsers = [
    { name: 'Arjun Singh', role: 'Lead Rescuer', device_id: 'RES-0492', phone: '+91 98765 43210' },
    { name: 'Meera K.', role: 'Rescuer', device_id: 'RES-0511', phone: '+91 98765 43211' },
    { name: 'Rohan Varma', role: 'Medic', device_id: 'RES-0488', phone: '+91 98765 43212' },
    { name: 'Suresh Kumar', role: 'Medic', device_id: 'RES-0495', phone: '+91 98765 43213' },
    { name: 'Priya Raj', role: 'Rescuer', device_id: 'RES-0502', phone: '+91 98765 43214' },
    { name: 'Vikram Seth', role: 'Pilot', device_id: 'RES-0601', phone: '+91 98765 43215' }
];

db.serialize(() => {
    // Ensure tables exist
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        role TEXT,
        device_id TEXT UNIQUE,
        phone TEXT,
        status TEXT DEFAULT 'active',
        last_seen DATETIME,
        registered_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        group_name TEXT UNIQUE,
        member_count INTEGER DEFAULT 0,
        role_type TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS group_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        group_id INTEGER,
        assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, group_id)
    )`);

    console.log('Seeding groups...');
    const groupStmt = db.prepare('INSERT INTO groups (group_name, role_type, description) VALUES (?, ?, ?)');
    dummyGroups.forEach(g => groupStmt.run(g.name, g.role, g.desc));
    groupStmt.finalize();

    console.log('Seeding users...');
    const userStmt = db.prepare('INSERT INTO users (name, role, device_id, phone) VALUES (?, ?, ?, ?)');
    dummyUsers.forEach(u => userStmt.run(u.name, u.role, u.device_id, u.phone));
    userStmt.finalize();

    console.log('Assigning initial members...');
    db.all('SELECT id FROM groups', (err, groups) => {
        db.all('SELECT id FROM users', (err, users) => {
            if (groups && users && groups.length >= 3 && users.length >= 5) {
                // Alpha (G1): Arjun, Meera
                db.run('INSERT INTO group_members (user_id, group_id) VALUES (?, ?)', [users[users.length-6].id, groups[groups.length-4].id]);
                db.run('INSERT INTO group_members (user_id, group_id) VALUES (?, ?)', [users[users.length-5].id, groups[groups.length-4].id]);
                
                // Bravo (G2): Rohan, Suresh
                db.run('INSERT INTO group_members (user_id, group_id) VALUES (?, ?)', [users[users.length-4].id, groups[groups.length-3].id]);
                db.run('INSERT INTO group_members (user_id, group_id) VALUES (?, ?)', [users[users.length-3].id, groups[groups.length-3].id]);
                
                // Delta (G3): Priya, Arjun
                db.run('INSERT INTO group_members (user_id, group_id) VALUES (?, ?)', [users[users.length-2].id, groups[groups.length-2].id]);
                db.run('INSERT INTO group_members (user_id, group_id) VALUES (?, ?)', [users[users.length-6].id, groups[groups.length-2].id]);
            }
            console.log('Seed completed!');
            db.close();
        });
    });
});
