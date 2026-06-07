#!/bin/bash
echo "[ADMIN] Launching Web Admin Interface..."
# Assuming we are running from the project root
FILE_PATH="system-backend/public/Web ADMIN.html"

if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$FILE_PATH"
elif command -v open >/dev/null 2>&1; then
    open "$FILE_PATH"
else
    echo "[ADMIN] Could not open browser automatically. Please open '$FILE_PATH' manually."
fi
