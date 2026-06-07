const sqlite3 = require('sqlite3').verbose();
const path = require('path');

function clearTasks(label, dbPath) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error(`Error opening database ${label}:`, err);
                reject(err);
                return;
            }
            console.log(`\n=== DATABASE: ${label} (${dbPath}) ===`);
        });

        db.serialize(() => {
            // Update the status of mock/test tasks to 'completed'
            const mockTaskIds = [1, 3, 4];
            const idsStr = mockTaskIds.join(', ');
            
            db.run(`UPDATE rescue_requests SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id IN (${idsStr})`, function(err) {
                if (err) {
                    console.error(`Error updating rescue_requests in ${label}:`, err);
                } else {
                    console.log(`Updated ${this.changes} rescue_requests to 'completed' status.`);
                }
            });

            // Also complete any related command queue dispatches for these requests
            db.run(`UPDATE command_queue SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE status != 'completed'`, function(err) {
                if (err) {
                    console.error(`Error updating command_queue in ${label}:`, err);
                } else {
                    console.log(`Updated ${this.changes} command_queue items to 'completed' status.`);
                }
                db.close(() => resolve());
            });
        });
    });
}

async function run() {
    try {
        await clearTasks('BACKEND DB', path.join(__dirname, 'rescue.db'));
        await clearTasks('ROOT DB', path.join(__dirname, '../rescue.db'));
        console.log('\nAll mock/stuck tasks successfully cleared from both databases.');
    } catch (e) {
        console.error(e);
    }
}

run();
