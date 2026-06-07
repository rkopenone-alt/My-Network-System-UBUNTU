import os
import shutil

src_rescuer = r"C:\Users\Alienware\Desktop\Rescue Backup 26-04-2026\rescuer-app\android\app\build\outputs\apk\release\app-release.apk"
src_public = r"C:\Users\Alienware\Desktop\Rescue Backup 26-04-2026\public-sos-app\android\app\build\outputs\apk\release\app-release.apk"

dest_rescuer = r"C:\Users\Alienware\Desktop\Rescue Backup 26-04-2026\Output_APKs\rescuer-app-release.apk"
dest_public = r"C:\Users\Alienware\Desktop\Rescue Backup 26-04-2026\Output_APKs\public-sos-app-release.apk"

if os.path.exists(src_rescuer):
    shutil.copy2(src_rescuer, dest_rescuer)
    print("Rescuer APK copied.")
else:
    print("Rescuer APK not found.")

if os.path.exists(src_public):
    shutil.copy2(src_public, dest_public)
    print("Public APK copied.")
else:
    print("Public APK not found.")
