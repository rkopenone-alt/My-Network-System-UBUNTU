import re

with open('preview-web-admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace .toLocaleTimeString
content = re.sub(r'new Date\(([^)]+)\)\.toLocaleTimeString\(\[\],\s*\{\s*hour:\s*\'2-digit\',\s*minute:\s*\'2-digit\'\s*\}\)', r'formatLocalTime(\1)', content)

# Replace .toLocaleString
content = re.sub(r'new Date\(([^)]+)\)\.toLocaleString\(\)', r'formatLocalDate(\1)', content)

with open('preview-web-admin.html', 'w', encoding='utf-8') as f:
    f.write(content)
