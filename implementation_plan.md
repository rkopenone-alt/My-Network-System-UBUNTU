# Implementation Plan - Grouped Mission Coordinate & Routing Fix

This implementation plan details the diagnosis and solution for the grouped mission (tactical cluster) routing and coordinate plotting bugs in the Rescuer Mobile App.

## Root Cause Analysis

We identified two major issues causing grouped missions to navigate to `[0, 0]` with empty perimeter coordinates:

1. **Auto-Refresh Checkbox Race Condition:**
   - In `preview-web-admin.html`, the background auto-refresh loop (`runAll()`) runs every 5 seconds, calling `fetchRescueRequests()` and subsequently `updateMgmtPage()`.
   - `updateMgmtPage()` fully rebuilds and re-renders the Triage board columns (Columns 1, 2, and 3) from scratch.
   - When columns are re-rendered, any checked `.mgmt-select-checkbox` checkboxes get replaced by brand new, unchecked checkboxes in the DOM.
   - If a commander takes more than a few seconds in `openBulkGroupView()` to name the cluster, choose the team, and review the convex hull map, the background auto-refresh wipes out their checked boxes in the background.
   - When clicking **"CONFIRM & INITIALIZE GROUP MISSION"**, `confirmBulkGrouping()` queries the checked boxes in the DOM, finds **0** checked items, and posts an empty payload to the backend:
     `{"name":"test 2","is_group_mission":true,"request_ids":[],"serial_numbers":[],"custom_polygon":...}`
   - Due to the empty `request_ids` list, the database saves a command with no clustered requests and defaults the group coordinates to `[0, 0]`.

2. **Missing Mission Coordinates in Command Payload:**
   - In the fallback path of the Rescuer App's accepted mission routing (`startMission`), if a network hiccup or caching timing prevents fetching `/api/users/:id/combined-history` containing the populated `missions` list, the app retrieves the command payload directly from `/api/commands/:id`.
   - The command payload created by the Web Admin did not include the physical coordinates (`lat`/`lng` and types) of each clustered task inside `command_payload`. It only saved a list of IDs.
   - When falling back to the raw payload, the app evaluates `payload.missions` as undefined, resulting in an empty convex hull rendering and broken zone navigation.

---

## Proposed Changes

### 1. Web Admin Panel

#### [MODIFY] [preview-web-admin.html](file:///c:/Users/Alienware/Desktop/Rescue%20Backup%2026-04-2026/preview-web-admin.html)

- **Persistent Selection State:**
  - Create a persistent selection array `window.bulkSelectedIds` inside `openBulkGroupView()` when the group creation pane is opened.
  - Modify `confirmBulkGrouping()` to read from `window.bulkSelectedIds` instead of re-querying active checked boxes in the DOM, eliminating the background refresh race condition.
- **Safety Guards:**
  - Add strict input validation to `confirmBulkGrouping()`:
    ```javascript
    if (!selectedIds || selectedIds.length === 0) {
        alert("ERROR: No missions selected or selection list was updated in the background. Please close this pane, select the tasks again, and click Group & Assign.");
        return;
    }
    ```
- **Robust Command Payload Enrichment:**
  - Enrich the `command_payload` in both `confirmBulkGrouping()` and `confirmTaskGrouping()` to include the full `missions` array with coordinates directly, supporting offline resilience and instant client-side map plotting:
    ```javascript
    missions: newGroupEntry.requests.map(r => ({
        id: r.id,
        type: r.type,
        lat: parseFloat(r.lat),
        lng: parseFloat(r.lng),
        sector: r.sector,
        priority: r.priority
    }))
    ```

---

### 2. Mobile Rescuer App (Web Template)

#### [MODIFY] [preview-rescuer.html](file:///c:/Users/Alienware/Desktop/Rescue%20Backup%2026-04-2026/preview-rescuer.html)

- Add robust validation in `startMission()` to handle group coordinates parsed from either `/combined-history` or raw `/api/commands/:id` payload fallbacks.
- If `groupCoords` contains coordinates but the center coordinate `finalLat`/`finalLng` is `0` or missing, automatically resolve it to the first mission's coordinates in the list to prevent zooming to `[0, 0]`.

---

### 3. Production Compilation & Deployment

#### [BUILD] Synchronize Web Template and Compile Android Release APK
- Run `python generate_html_str.py` to synchronize any updates made in `preview-rescuer.html` into `rescuer-app/htmlStr.js` for React Native.
- Execute Gradle release compilation in `rescuer-app/android` to build a clean, production-ready release APK.
- Copy the fresh APK to `C:\Users\Alienware\Desktop\Rescue Backup 26-04-2026\Output_APKs`.

---

## Verification Plan

### Automated & Database Checks
- Create a test tactical group in the Web Admin dashboard, wait over 10 seconds to confirm the background refresh does not wipe out the selection, and initiate the group.
- Query the database or fetch the `/api/commands` endpoint to confirm `request_ids` and `missions` are properly populated (not empty).

### Manual Map Plotting Verification
- Accept the grouped mission in the Rescuer Mobile App.
- Confirm the map instantly centers on the first mission coordinate and plots a purple dashed convex hull/boundary enclosing all clustered tasks.
