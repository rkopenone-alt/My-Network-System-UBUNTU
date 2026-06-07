const sqlite3 = require('sqlite3').verbose();
const path = require('path');

function queryDb(label, dbPath) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error(`Error opening database ${label}`, err);
                reject(err);
                return;
            }
            console.log(`\n=== DATABASE: ${label} (${dbPath}) ===`);
        });

        db.serialize(() => {
            db.all("SELECT id, name, phone, role FROM users", (err, users) => {
                if (err) console.error(err);
                console.log('USERS:', users);

                db.all("SELECT id, type, status, assigned_user_id, assigned_group_id, assigned_phone, details, urgency FROM rescue_requests WHERE status != 'completed'", (err, requests) => {
                    if (err) console.error(err);
                    console.log('ACTIVE RESCUE REQUESTS:', requests);

                    db.all("SELECT id, group_id, target_phone, status, command_payload, command_type FROM command_queue WHERE status != 'completed'", (err, commands) => {
                        if (err) console.error(err);
                        console.log('ACTIVE COMMAND QUEUE:', commands);
                        db.close(() => resolve());
                    });
                });
            });
        });
    });
}

async function run() {
    try {
        await queryDb('BACKEND DB', path.join(__dirname, 'rescue.db'));
        await queryDb('ROOT DB', path.join(__dirname, '../rescue.db'));
    } catch (e) {
        console.error(e);
    }
}

run();
