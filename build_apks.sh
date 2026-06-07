#!/bin/bash
# AntiGravity APK Builder for Ubuntu

echo "========================================="
echo "   AntiGravity Mobile App Builder       "
echo "========================================="
echo "Ensuring Android SDK and Java are configured..."

# Build Public App
echo "[*] Building Public SOS App..."
cd public-sos-app/android || exit 1
./gradlew assembleRelease
cd ../..

# Build Rescuer App
echo "[*] Building Field Rescuer App..."
cd rescuer-app/android || exit 1
./gradlew assembleRelease
cd ../..

# Copy Outputs
echo "[*] Copying built APKs to Output_APKs directory..."
mkdir -p Output_APKs

cp public-sos-app/android/app/build/outputs/apk/release/app-release.apk Output_APKs/public-sos-app-release.apk
cp rescuer-app/android/app/build/outputs/apk/release/app-release.apk Output_APKs/rescuer-app-release.apk

echo "========================================="
echo "   Build Complete!                      "
echo "   APKs are available in Output_APKs/   "
echo "========================================="
