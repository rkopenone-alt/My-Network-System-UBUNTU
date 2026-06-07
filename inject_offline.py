import os
import re

files_to_patch = ['preview-rescuer.html', 'preview-mobile-app.html', 'preview-web-admin.html']

offline_script = """
        // --- OFFLINE SYNC MANAGER ---
        const originalFetch = window.fetch;
        window.offlineQueue = JSON.parse(localStorage.getItem('offline_queue') || '[]');
        window.fetch = async function(url, options) {
            const isMutation = options && ['POST', 'PUT', 'DELETE'].includes(options.method);
            if (!navigator.onLine && isMutation) {
                console.log('[OFFLINE] Queuing request', url);
                window.offlineQueue.push({ url, options });
                localStorage.setItem('offline_queue', JSON.stringify(window.offlineQueue));
                return new Response(JSON.stringify({ success: true, offline: true, id: Date.now() }), { status: 200, headers: { 'Content-Type': 'application/json' } });
            }
            
            try {
                const res = await originalFetch(url, options);
                if (options === undefined || options.method === 'GET' || !options.method) {
                    if (url.includes('/history') || url.includes('/rescue-requests') || url.includes('/dashboard-stats') || url.includes('/zones') || url.includes('/users')) {
                        const clone = res.clone();
                        clone.text().then(data => {
                            localStorage.setItem('cache_' + url, data);
                        }).catch(() => {});
                    }
                }
                return res;
            } catch (e) {
                if (!navigator.onLine) {
                    if (isMutation) {
                        window.offlineQueue.push({ url, options });
                        localStorage.setItem('offline_queue', JSON.stringify(window.offlineQueue));
                        return new Response(JSON.stringify({ success: true, offline: true, id: Date.now() }), { status: 200, headers: { 'Content-Type': 'application/json' } });
                    } else {
                        const cached = localStorage.getItem('cache_' + url);
                        if (cached) {
                            return new Response(cached, { status: 200, headers: { 'Content-Type': 'application/json' } });
                        }
                    }
                }
                throw e;
            }
        };

        window.addEventListener('online', async () => {
            console.log('[ONLINE] Syncing offline queue...');
            const queue = JSON.parse(localStorage.getItem('offline_queue') || '[]');
            window.offlineQueue = [];
            localStorage.setItem('offline_queue', '[]');
            for (const req of queue) {
                try {
                    await originalFetch(req.url, req.options);
                } catch (e) {
                    console.error('Failed to sync', req, e);
                }
            }
            if (window.core && window.core.refresh) window.core.refresh();
            if (window.core && window.core.updateNetUI) window.core.updateNetUI(true);
        });
        // -----------------------------
"""

for fname in files_to_patch:
    if not os.path.exists(fname):
        continue
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if "OFFLINE SYNC MANAGER" not in content:
        # Inject right after the first <script> tag that is inline (no src)
        # We will look for <script>\n
        # or <script> that is before `const core =`
        idx = content.find("const core =")
        if idx != -1:
            # find previous <script>
            script_idx = content.rfind("<script>", 0, idx)
            if script_idx != -1:
                content = content[:script_idx+8] + "\n" + offline_script + content[script_idx+8:]

    # For rescuer app, fix the filter
    if fname == 'preview-rescuer.html':
        old_filter = "const activeData = historyData.filter(t => ['assigned', 'pending', 'accepted', 'ongoing', 'in_progress', 'acknowledged'].includes(t.status.toLowerCase()));"
        new_filter = "const activeData = historyData.filter(t => t.status && !['completed', 'resolved', 'inactive'].includes(t.status.toLowerCase()));"
        content = content.replace(old_filter, new_filter)

    with open(fname, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Offline sync patched in all HTML files.")
