import os
import re
import socket
import json
import sys

def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.254.254.254', 1))
        ip = s.getsockname()[0]
    except Exception:
        ip = '192.168.1.5' # fallback
    finally:
        s.close()
    return ip

local_ip = None
# Allow manual override via command line argument or environment variable
if len(sys.argv) > 1:
    local_ip = sys.argv[1]
    print(f"[*] Using manually specified IP address: {local_ip}")
elif os.environ.get('RESCUE_IP_OVERRIDE'):
    local_ip = os.environ.get('RESCUE_IP_OVERRIDE')
    print(f"[*] Using environment override IP address: {local_ip}")
else:
    local_ip = get_local_ip()
    print(f"[*] Detected Local LAN IP: {local_ip}")

# Files to update
workspace_dir = r"c:\Users\Alienware\Desktop\Rescue Backup 26-04-2026"
preview_rescuer = os.path.join(workspace_dir, "preview-rescuer.html")
preview_mobile = os.path.join(workspace_dir, "preview-mobile-app.html")
preview_admin = os.path.join(workspace_dir, "preview-web-admin.html")

rescuer_app_js = os.path.join(workspace_dir, "rescuer-app", "App.js")
rescuer_html_str = os.path.join(workspace_dir, "rescuer-app", "htmlStr.js")

public_app_js = os.path.join(workspace_dir, "public-sos-app", "App.js")
public_html_str = os.path.join(workspace_dir, "public-sos-app", "htmlStr.js")

# Function to replace IPs
def replace_ip_in_content(content, new_ip):
    # Replace hardcoded IP 192.168.x.x and 10.x.x.x
    content = re.sub(r'\b(?:192\.168|10)\.\d{1,3}\.\d{1,3}\.\d{1,3}\b', new_ip, content)
    # Replace localhost if in endpoint format
    content = content.replace("localhost:3001", f"{new_ip}:3001")
    content = content.replace("127.0.0.1:3001", f"{new_ip}:3001")
    return content


# 1. IP Injection removed per user request.



# Step 2 (Update React Native App JS files) has been removed to avoid pre-feeding IP addresses into APKs.

# 3. Generate htmlStr.js for rescuer-app
if os.path.exists(preview_rescuer) and os.path.exists(rescuer_html_str):
    print(f"[*] Compiling rescuer HTML string into htmlStr.js...")
    with open(preview_rescuer, 'r', encoding='utf-8') as f:
        html_content = f.read()
    js_content = f"export const htmlString = {json.dumps(html_content)};\n"
    with open(rescuer_html_str, 'w', encoding='utf-8') as f:
        f.write(js_content)

# 4. Generate htmlStr.js for public-sos-app
if os.path.exists(preview_mobile) and os.path.exists(public_html_str):
    print(f"[*] Compiling public mobile HTML string into htmlStr.js...")
    with open(preview_mobile, 'r', encoding='utf-8') as f:
        html_content = f.read()
    js_content = f"export const htmlString = {json.dumps(html_content)};\n"
    with open(public_html_str, 'w', encoding='utf-8') as f:
        f.write(js_content)

print("[+] Synchronizer Completed Successfully!")
