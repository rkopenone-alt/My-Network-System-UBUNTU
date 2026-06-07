const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./rescue.db');
db.all("SELECT * FROM settings", (err, rows) => {
    if (err) console.error(err);
    console.log("SETTINGS:", rows);
});
db.all("SELECT * FROM users LIMIT 10", (err, rows) => {
    if (err) console.error(err);
    console.log("USERS:", rows);
});
