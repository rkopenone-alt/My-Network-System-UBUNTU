const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./rescue.db');
db.all("SELECT id, name, phone, role FROM users", (err, rows) => {
    if (err) console.error(err);
    console.log(rows);
});
