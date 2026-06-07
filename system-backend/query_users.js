const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../rescue.db');
db.all("SELECT id, name, phone, password, status FROM users WHERE role='rescuer'", (err, rows) => {
    if (err) console.error(err);
    console.log(rows);
});
