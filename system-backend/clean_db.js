const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'rescue.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database for cleaning:', err);
        process.exit(1);
    }
    console.log('Database opened at', dbPath);
});

db.serialize(() => {
    console.log('Purging mock, test, and dummy records from rescue.db...');

    // 1. Clean users
    db.run("DELETE FROM users WHERE name LIKE '%TEST%' OR name LIKE '%DUMMY%' OR name LIKE '%Test%' OR name LIKE '%Dummy%' OR serial_number LIKE '%TEST%' OR serial_number LIKE '%DUMMY%'", function(err) {
        if (err) console.error('Error cleaning users:', err);
        else console.log(`Cleared ${this.changes} test users.`);
    });

    // 2. Clean rescue_requests
    db.run("DELETE FROM rescue_requests WHERE details LIKE '%TEST%' OR details LIKE '%DUMMY%' OR details LIKE '%Test%' OR details LIKE '%Dummy%' OR device_id LIKE '%TEST%' OR device_id LIKE '%DUMMY%'", function(err) {
        if (err) console.error('Error cleaning rescue_requests:', err);
        else console.log(`Cleared ${this.changes} test rescue requests.`);
    });

    // 3. Clean command_queue
    db.run("DELETE FROM command_queue WHERE command_payload LIKE '%TEST%' OR command_payload LIKE '%DUMMY%' OR command_payload LIKE '%Test%' OR command_payload LIKE '%Dummy%'", function(err) {
        if (err) console.error('Error cleaning command_queue:', err);
        else console.log(`Cleared ${this.changes} test command queues.`);
    });

    // 4. Clean operation_history
    db.run("DELETE FROM operation_history WHERE name LIKE '%TEST%' OR name LIKE '%DUMMY%' OR name LIKE '%Test%' OR name LIKE '%Dummy%'", function(err) {
        if (err) console.error('Error cleaning operation_history:', err);
        else console.log(`Cleared ${this.changes} test operations.`);
    });

    // 5. Clean sos_alerts
    db.run("DELETE FROM sos_alerts WHERE details LIKE '%TEST%' OR details LIKE '%DUMMY%' OR details LIKE '%Test%' OR details LIKE '%Dummy%' OR device_id LIKE '%TEST%' OR device_id LIKE '%DUMMY%'", function(err) {
        if (err) console.error('Error cleaning sos_alerts:', err);
        else console.log(`Cleared ${this.changes} test sos alerts.`);
    });
});

db.close((err) => {
    if (err) {
        console.error('Error closing database:', err);
    } else {
        console.log('Database cleaning completed successfully.');
    }
});
