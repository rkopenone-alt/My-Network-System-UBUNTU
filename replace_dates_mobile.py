import re

helpers = '''
        // Timezone conversion helpers
        function formatLocalTime(dbTimeStr) {
            if (!dbTimeStr) return '--:--';
            let t = dbTimeStr.trim();
            if (!t.includes('T')) t = t.replace(' ', 'T');
            if (!t.endsWith('Z') && !t.includes('+')) t += 'Z';
            try {
                const d = new Date(t);
                if (isNaN(d)) return dbTimeStr;
                return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } catch(e) { return dbTimeStr; }
        }

        function formatLocalDate(dbTimeStr) {
            if (!dbTimeStr) return '--/--/----';
            let t = dbTimeStr.trim();
            if (!t.includes('T')) t = t.replace(' ', 'T');
            if (!t.endsWith('Z') && !t.includes('+')) t += 'Z';
            try {
                const d = new Date(t);
                if (isNaN(d)) return dbTimeStr;
                return d.toLocaleString();
            } catch(e) { return dbTimeStr; }
        }
'''

def process_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'function formatLocalTime(' not in content:
        content = re.sub(r'(<script>)', r'\1\n' + helpers, content, count=1)
    
    # Replace .toLocaleTimeString
    content = re.sub(r'new Date\(([^)]+)\)\.toLocaleTimeString\([^)]*\)', r'formatLocalTime(\1)', content)
    
    # Replace .toLocaleString and .toLocaleDateString
    content = re.sub(r'new Date\(([^)]+)\)\.toLocale(?:Date)?String\([^)]*\)', r'formatLocalDate(\1)', content)
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

process_file('preview-mobile-app.html')
process_file('preview-rescuer.html')
