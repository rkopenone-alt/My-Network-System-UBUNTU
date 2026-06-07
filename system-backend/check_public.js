const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('rescue.db');
db.all("SELECT id, name, phone, password, status, role FROM users WHERE role='public'", (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        console.log(JSON.stringify(rows, null, 2));
    }
    db.close();
});
