import sys
with open('preview-rescuer.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('\\', '\\\\')
html = html.replace('`', '\\`')
html = html.replace('$', '\\$')

js = 'export const htmlString = `' + html + '`;\n'

with open('rescuer-app/htmlStr.js', 'w', encoding='utf-8') as f:
    f.write(js)
