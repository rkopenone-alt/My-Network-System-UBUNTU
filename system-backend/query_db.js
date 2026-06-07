const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('rescue.db');

db.all("SELECT id, command_type, status, command_payload FROM command_queue ORDER BY id DESC LIMIT 5", [], (err, rows) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log("=== RECENT COMMANDS ===");
    rows.forEach(r => {
        console.log(`ID: ${r.id} | Type: ${r.command_type} | Status: ${r.status}`);
        console.log(`Payload: ${r.command_payload}`);
        console.log("------------------------");
    });
    db.close();
});
