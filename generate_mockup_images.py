from html2image import Html2Image
from PIL import Image, ImageDraw, ImageFont
import os

hti = Html2Image()
html_file = 'mockup_screens.html'

# We'll just generate the entire page at a huge resolution and crop out the pieces.
hti.screenshot(html_file='mockup_screens.html', save_as='raw_ui.png', size=(1800, 2000))

# Open the raw image and crop (we know the approximate locations based on flexbox)
# But it's easier to just pass individual HTML strings to hti!
html_shell = """
<!DOCTYPE html>
<html><head><style>
  body { background: #f0f2f5; font-family: 'Segoe UI', sans-serif; display: flex; padding: 20px; }
  .mobile-app { width: 375px; height: 812px; background: #ffffff; border-radius: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 8px solid #333; overflow: hidden; position: relative; display: flex; flex-direction: column; }
  .app-header { background: #0066cc; color: white; padding: 40px 20px 15px; font-size: 20px; font-weight: bold; text-align: center; }
  .app-content { flex: 1; padding: 20px; display: flex; flex-direction: column; gap: 15px; background: #f9f9f9; }
  .bottom-nav { background: white; border-top: 1px solid #ddd; padding: 15px; display: flex; justify-content: space-around; }
  .nav-icon { width: 30px; height: 30px; background: #ccc; border-radius: 5px; }
  .nav-icon.active { background: #0066cc; }
  .btn { padding: 15px; border-radius: 10px; font-size: 18px; font-weight: bold; text-align: center; color: white; margin-bottom: 10px; }
  .btn-medical { background: #e74c3c; } .btn-flood { background: #3498db; } .btn-fire { background: #e67e22; }
  .btn-accept { background: #2ecc71; } .btn-decline { background: #e74c3c; border: 2px solid #c0392b; }
  .map-area { background: #e0e0e0 url('https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/St_Louis_street_map.png/500px-St_Louis_street_map.png') center/cover; position: relative; }
  .marker { width: 20px; height: 20px; border-radius: 50%; position: absolute; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5); }
  .marker.victim { background: #e74c3c; } .marker.rescuer { background: #3498db; }
  .route-line { position: absolute; border-left: 4px dashed #3498db; border-top: 4px dashed #3498db; }
  .web-admin { width: 1024px; height: 768px; background: #ffffff; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); display: flex; overflow: hidden; border: 1px solid #ccc; }
  .admin-sidebar { width: 300px; background: #f4f6f8; border-right: 1px solid #ddd; padding: 20px; }
  .admin-main { flex: 1; display: flex; flex-direction: column; }
  .admin-header { background: white; border-bottom: 1px solid #ddd; padding: 15px 20px; font-size: 20px; font-weight: bold; }
  .admin-map { flex: 1; position: relative; }
  .panel { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
</style></head><body>
{content}
</body></html>
"""

components = {
    'public_home.png': ('<div class="mobile-app"><div class="app-header">ARDMS Public Support</div><div class="app-content" style="justify-content: center;"><h2 style="text-align:center; color:#333;">What is your emergency?</h2><div class="btn btn-medical">🚨 Medical Emergency</div><div class="btn btn-flood">🌊 Flood Rescue</div><div class="btn btn-fire">🔥 Fire Emergency</div></div><div class="bottom-nav"><div class="nav-icon active"></div><div class="nav-icon"></div><div class="nav-icon"></div></div></div>', 430, 870),
    'public_sos.png': ('<div class="mobile-app"><div class="app-header" style="background:#e74c3c;">SOS TRIGGERED</div><div class="app-content map-area" style="padding:0;"><div class="marker victim" style="top:50%; left:50%; width:30px; height:30px;"></div></div><div style="padding: 20px; background:white;"><h3 style="margin-top:0;">Broadcasting Signal...</h3><p><strong>GPS:</strong> Lat 34.05, Lng -118.24</p><p><strong>Status:</strong> Waiting for Admin assignment</p><div class="btn btn-decline" style="margin:0;">Cancel SOS</div></div></div>', 430, 870),
    'admin_assign.png': ('<div class="web-admin"><div class="admin-sidebar"><h2 style="margin-top:0; color:#0066cc;">ARDMS Admin</h2><div class="panel" style="border-left: 4px solid #e74c3c;"><strong>⚠️ Medical Emergency</strong><br><small>Victim ID: #8492 | Just now</small><hr style="border:0; border-top:1px solid #eee;"><select style="width:100%; padding:8px; margin-bottom:10px;"><option>Select Rescuer...</option><option selected>Unit 12 - John (2.1 km away)</option></select><button class="btn btn-medical" style="width:100%; font-size:14px; padding:10px;">Dispatch Unit</button></div></div><div class="admin-main"><div class="admin-header">Live Monitoring Dashboard</div><div class="admin-map map-area"><div class="marker victim" style="top:30%; left:40%;"></div><div class="marker rescuer" style="top:60%; left:50%;"></div></div></div></div>', 1080, 820),
    'admin_group.png': ('<div class="web-admin"><div class="admin-sidebar"><h2 style="margin-top:0; color:#0066cc;">ARDMS Admin</h2><div class="panel" style="border-left: 4px solid #3498db; background:#ebf5fb;"><strong>📦 Grouped Supplies Request</strong><br><small>Selected: 4 Households in Flood Zone B</small><hr style="border:0; border-top:1px solid #c5e0f6;"><p style="font-size:12px;">Items: Water (x20), Blankets (x10)</p><button class="btn btn-flood" style="width:100%; font-size:14px; padding:10px;">Assign Group Task</button></div></div><div class="admin-main"><div class="admin-header">Tactical Routing (Supplies)</div><div class="admin-map map-area"><div class="marker victim" style="top:30%; left:40%;"></div><div class="marker victim" style="top:35%; left:45%;"></div><div class="marker victim" style="top:40%; left:38%;"></div><div class="marker victim" style="top:25%; left:42%;"></div><div style="position:absolute; top:20%; left:35%; width:100px; height:100px; border: 2px dashed #3498db; border-radius:10px; background:rgba(52, 152, 219, 0.2);"></div></div></div></div>', 1080, 820),
    'rescuer_accept.png': ('<div class="mobile-app"><div class="app-header" style="background:#f1c40f; color:#333;">INCOMING MISSION</div><div class="app-content" style="justify-content: center;"><div style="background: white; padding: 20px; border-radius:15px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); text-align:center;"><div style="font-size: 50px; margin-bottom:10px;">🚨</div><h2 style="margin:0;">Medical Alert</h2><p style="color:#666;">Distance: 2.1 km<br>Est. Time: 6 mins</p><div class="btn btn-accept">ACCEPT TASK</div><div class="btn btn-decline" style="background:white; color:#e74c3c;">Decline</div></div></div><div class="bottom-nav"><div class="nav-icon active"></div><div class="nav-icon"></div><div class="nav-icon"></div></div></div>', 430, 870),
    'rescuer_nav.png': ('<div class="mobile-app"><div class="app-header" style="background:#2ecc71;">NAVIGATING TO VICTIM</div><div class="app-content map-area" style="flex:1; padding:0;"><div class="marker victim" style="top:20%; left:70%;"></div><div class="marker rescuer" style="top:80%; left:30%;"></div><div class="route-line" style="top:25%; left:35%; width:130px; height:440px;"></div></div><div style="padding: 15px; background:white;"><div style="display:flex; justify-content:space-between; margin-bottom:10px;"><strong>Turn left on 5th Ave</strong><strong style="color:#2ecc71;">6 min (2.1 km)</strong></div><div class="btn btn-medical" style="margin:0; font-size:16px;">MARK COMPLETED</div></div></div>', 430, 870),
    'rescuer_history.png': ('<div class="mobile-app"><div class="app-header">MISSION HISTORY</div><div class="app-content"><div class="panel"><strong style="color:#2ecc71;">✔ Completed - Medical</strong><br><small>May 23, 2026 - 10:15 AM</small></div><div class="panel"><strong style="color:#2ecc71;">✔ Completed - Flood Evac</strong><br><small>May 22, 2026 - 04:30 PM</small></div><div class="panel"><strong style="color:#2ecc71;">✔ Completed - Fire Support</strong><br><small>May 20, 2026 - 02:00 AM</small></div></div><div class="bottom-nav"><div class="nav-icon"></div><div class="nav-icon"></div><div class="nav-icon active"></div></div></div>', 430, 870)
}

for filename, (content, w, h) in components.items():
    rendered_html = html_shell.replace('{content}', content)
    with open('temp.html', 'w', encoding='utf-8') as f:
        f.write(rendered_html)
    hti.screenshot(html_file='temp.html', save_as=filename, size=(w, h))
    print(f"Generated {filename}")

# Create Master Diagram using PIL
# Master Flow: Public Home -> Public SOS -> Admin Assign -> Rescuer Accept -> Rescuer Nav
print("Generating master diagram...")
try:
    img1 = Image.open('public_sos.png')
    img2 = Image.open('admin_assign.png')
    img3 = Image.open('rescuer_accept.png')
    
    # Create a large canvas
    canvas_w = img1.width + img2.width + img3.width + 400
    canvas_h = max(img1.height, img2.height, img3.height) + 200
    master = Image.new('RGB', (canvas_w, canvas_h), '#ffffff')
    
    # Paste images
    master.paste(img1, (50, 100))
    master.paste(img2, (img1.width + 150, 100))
    master.paste(img3, (img1.width + img2.width + 250, 100))
    
    # Draw arrows
    draw = ImageDraw.Draw(master)
    
    # Arrow 1: Public -> Admin
    start1 = (img1.width + 50, canvas_h//2)
    end1 = (img1.width + 150, canvas_h//2)
    draw.line([start1, end1], fill='#3498db', width=10)
    draw.polygon([(end1[0], end1[1]-15), (end1[0]+20, end1[1]), (end1[0], end1[1]+15)], fill='#3498db')
    
    # Arrow 2: Admin -> Rescuer
    start2 = (img1.width + img2.width + 150, canvas_h//2)
    end2 = (img1.width + img2.width + 250, canvas_h//2)
    draw.line([start2, end2], fill='#2ecc71', width=10)
    draw.polygon([(end2[0], end2[1]-15), (end2[0]+20, end2[1]), (end2[0], end2[1]+15)], fill='#2ecc71')
    
    master.save('master_flow.png')
    print("Generated master_flow.png")
except Exception as e:
    print("Master flow generation error:", e)
