const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./rescue.db');

const get = (sql, params = []) => new Promise((res, rej) =>
    db.get(sql, params, (err, row) => err ? rej(err) : res(row)));
const all = (sql, params = []) => new Promise((res, rej) =>
    db.all(sql, params, (err, rows) => err ? rej(err) : res(rows)));

async function run() {
    try {
        const userId = 1; // let's try with user ID 1
        const user = await get(`SELECT * FROM users WHERE id = ?`, [userId]);
        console.log('User:', user);
        if (!user) {
            console.log('User 1 not found');
            return;
        }

        const groups = await all(`SELECT group_id FROM group_members WHERE user_id = ?`, [userId]);
        const groupIds = groups.map(g => g.group_id);
        console.log('Group IDs:', groupIds);

        let personalReqQuery = `SELECT 'request' as source, id, type, sector, status, lat, lng, created_at, updated_at, image_url, audio_url, completion_image_url, details, priority FROM rescue_requests WHERE (assigned_user_id = ?)`;
        let reqParams = [userId];
        if (groupIds.length > 0) {
            personalReqQuery += ` OR (assigned_group_id IN (${groupIds.map(() => '?').join(',')}))`;
            reqParams = reqParams.concat(groupIds);
        }
        const personalReqs = await all(personalReqQuery, reqParams);
        console.log(`Fetched ${personalReqs.length} personal/group requests`);

        const cleanPhone = (user.phone || '').replace(/\D/g, '').slice(-10);
        const cleanDeviceId = (user.device_id || '').trim();
        console.log('Clean phone:', cleanPhone, 'Clean device ID:', cleanDeviceId);

        let phoneOrDeviceClauses = [];
        let params = [];
        if (cleanPhone) {
            phoneOrDeviceClauses.push(`REPLACE(REPLACE(cq.target_phone, '+', ''), ' ', '') LIKE ?`);
            params.push(`%${cleanPhone}%`);
        }
        if (cleanDeviceId) {
            phoneOrDeviceClauses.push(`cq.target_phone = ?`);
            params.push(cleanDeviceId);
        }
        phoneOrDeviceClauses.push(`(CASE WHEN json_valid(cq.command_payload) THEN CAST(json_extract(cq.command_payload, '$.rescue_req_id') AS TEXT) ELSE NULL END) IN (SELECT CAST(id AS TEXT) FROM rescue_requests WHERE assigned_user_id = ?)`);
        params.push(userId);

        const matchClause = phoneOrDeviceClauses.length > 0 ? `(${phoneOrDeviceClauses.join(' OR ')})` : '1=0';

        let commandQuery = `SELECT 'command' as source, cq.id, cq.command_type as type, 'HQ Order' as sector, cq.status, cq.created_at, cq.updated_at, cq.command_payload, cq.priority, rr.image_url, rr.audio_url, cq.completion_image_url, rr.details as rescue_details 
                           FROM command_queue cq
                           LEFT JOIN rescue_requests rr ON CAST(rr.id AS TEXT) = (CASE WHEN json_valid(cq.command_payload) THEN CAST(json_extract(cq.command_payload, '$.rescue_req_id') AS TEXT) ELSE NULL END)
                           WHERE (${matchClause})`;

        if (groupIds.length > 0) {
            commandQuery += ` OR (cq.group_id IN (${groupIds.map(() => '?').join(',')}))`;
            params = params.concat(groupIds);
        }

        console.log('Command query params:', params);
        const commands = await all(commandQuery, params);
        console.log(`Fetched ${commands.length} commands`);

        const processedCommands = await Promise.all(commands.map(async c => {
            let payload = {};
            try { payload = JSON.parse(c.command_payload); } catch (e) { }

            let groupMissions = [];
            if (c.type === 'group' && payload.is_group_mission && payload.request_ids && payload.request_ids.length > 0) {
                try {
                    groupMissions = await all(`SELECT id, type, lat, lng, sector, details, priority FROM rescue_requests WHERE id IN (${payload.request_ids.map(()=>'?').join(',')})`, payload.request_ids);
                } catch(e) {}
            }

            return {
                source: c.source,
                id: c.id,
                type: c.type,
                sector: payload.name || payload.sector || payload.message || c.sector || 'Group Cluster',
                status: c.status,
                lat: payload.lat || (groupMissions.length > 0 ? groupMissions[0].lat : null),
                lng: payload.lng || (groupMissions.length > 0 ? groupMissions[0].lng : null),
                image_url: c.image_url,
                audio_url: c.audio_url || (personalReqs.find(pr => String(pr.id) === String(payload.rescue_req_id))?.audio_url) || null,
                completion_image_url: c.completion_image_url || (personalReqs.find(pr => String(pr.id) === String(payload.rescue_req_id))?.completion_image_url) || null,
                priority: c.priority || 'normal',
                details: c.type === 'group' ? JSON.stringify({ isGroup: true, missions: groupMissions, custom_polygon: payload.custom_polygon || null }) : (c.rescue_details || payload.details || null),
                requester_phone: payload.requester_phone || null,
                requester_name: payload.requester_name || null,
                command_payload: c.command_payload,
                created_at: c.created_at,
                updated_at: c.updated_at
            };
        }));

        const combined = [...personalReqs, ...processedCommands].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        console.log('Combined history items length:', combined.length);
        if (combined.length > 0) {
            console.log('First combined history item:', combined[0]);
        }
    } catch (err) {
        console.error('Error running test:', err);
    } finally {
        db.close();
    }
}

run();
