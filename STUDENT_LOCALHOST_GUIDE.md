# 🎓 Student's Guide: Running the ARDMS Emergency Suite on Localhost

Welcome! This guide is designed to help you set up and run the **ARDMS Emergency Suite** on a new Windows laptop. 

If you are a student learning web development, networking, or software engineering, this is a real-world example of how **client-server systems** work. By the end of this guide, you will have a local server running on your computer, and you'll even be able to connect your mobile phone to it!

---

## 🌟 The Core Concept: What is "Localhost"?

Before we start, let's understand two basic terms:
1. **Localhost (`127.0.0.1`)**: This is a special address that tells your computer to "talk to itself." When you run a server on `localhost`, only your laptop can see it. It is strictly offline and private to this device.
2. **Local IP / LAN IP (e.g., `192.168.1.X`)**: This is the address assigned to your laptop by your home or school Wi-Fi router. If your laptop and your mobile phone are connected to the **same Wi-Fi**, they can talk to each other using this address. This lets you test the mobile apps on your phone!

---

## 🛠️ Step 1: Pre-installation (The Tools You Need)

To run this software, your laptop needs a few free development tools. Follow these links and install them:

1. **Node.js (Version 18 or newer)**  
   * **What it is**: The engine that executes our backend JavaScript code.
   * **How to get it**: Go to [nodejs.org](https://nodejs.org/), download the **LTS (Recommended for Most Users)** version, and run the installer. Click "Next" on all default prompts.
2. **Python (Version 3.x)**  
   * **What it is**: Used to run a helper script that automatically configures our app files to point to the correct IP address.
   * **How to get it**: Go to [python.org](https://www.python.org/downloads/), download the installer.  
     Make sure to check the box that says **"Add Python to PATH"** before clicking Install.
3. **Google Chrome** (or any modern browser)  
   * **What it is**: Used to view the Command Center dashboard.

---

## 🚀 Step 2: Setting Up the Files

1. Open the project folder on your laptop: `C:\Users\Alienware\Desktop\Rescue Backup 26-04-2026`.
2. Let's look at the main directories inside it:
   * **`system-backend`**: Contains the Node.js server, database (`rescue.db`), and APIs.
   * **`preview-web-admin.html`**: The Command Center dashboard.
   * **`preview-mobile-app.html`**: The Citizen SOS application preview.
   * **`preview-rescuer.html`**: The Rescuer Officer application preview.

---

## 💻 Step 3: How to Open PowerShell in the Project Folder

PowerShell is a command terminal (like a text-based controller for your laptop). To run commands, you need to open PowerShell **directly inside** the project folder. Here are the 3 ways to do it, ordered from easiest to hardest:

### Method 1: The Address Bar Shortcut (Easiest & Recommended! ⭐)
1. Open **File Explorer** and double-click your way into the project folder:  
   `C:\Users\Alienware\Desktop\Rescue Backup 26-04-2026`
2. Look at the top of the window where it shows the folder path (the **Address Bar**).
3. **Click once** on any empty space inside that address bar. The path will light up in blue.
4. Type **`powershell`** directly over it and press **Enter**.
5. *A blue terminal window will open up. You will see that the text prompt already says: `PS C:\Users\Alienware\Desktop\Rescue Backup 26-04-2026>`. This means you are inside the folder!*

### Method 2: Shift + Right-Click
1. Open the project folder in File Explorer.
2. Hold down the **`Shift`** key on your keyboard.
3. **Right-click** on any empty white space inside the folder.
4. From the menu that pops up, click **"Open PowerShell window here"** (or **"Open in Terminal"**).

### Method 3: The Manual `cd` Command
1. Click the Windows Start menu (bottom-left corner), type **`powershell`**, and press **Enter**.
2. A blue window will open. Type **`cd`** followed by a space, then type the folder path in double quotes, and press **Enter**:
   ```powershell
   cd "C:\Users\Alienware\Desktop\Rescue Backup 26-04-2026"
   ```

---

## 🌐 Step 4: Getting Your Wi-Fi IP Address (Running `ipconfig`)

If you want your mobile phone to connect to your laptop's server over Wi-Fi, the phone needs to know your laptop's specific network address.

### How to do `ipconfig`:
1. Open PowerShell inside the project folder using **Method 1** above.
2. Type **`ipconfig`** (stands for *IP Configuration*) and press the **Enter** key:
   ```powershell
   ipconfig
   ```
3. A large block of text will print on the screen. Do not panic! Scroll up or down and look for a specific section:
   * **If you are connected to Wi-Fi**: Look for the header **`Wireless LAN adapter Wi-Fi`**.
   * **If your phone is tethered via USB cable**: Look for the header **`Ethernet adapter Ethernet 2`** or **`NDIS Internet Sharing Device`**.
4. In that section, find the line named **`IPv4 Address`**.
5. It will look like four numbers separated by dots. For example:
   * `192.168.1.4`
   * `192.168.43.15`
6. **Write down this address!** This is the network address your phone will use to talk to your computer.

---

## 🔄 Step 5: Synchronizing the Apps to Your IP

We have a Python script that automatically updates all the HTML and React Native code files to use your computer's IP address.

1. In the PowerShell window you opened in Step 3, run the sync script. Replace `YOUR_IP` with the IPv4 address you found in Step 4:
   ```powershell
   python sync_apps.py 192.168.1.4
   ```
   *(If you just want to test offline on your laptop only, you can run `python sync_apps.py 127.0.0.1` instead).*

You will see confirmation messages saying that the preview files and application files have been successfully updated.


---

## 🛡️ Step 5: Unblocking Windows Firewall

By default, Windows Defender blocks other devices from connecting to your laptop to keep you safe. We need to tell the firewall that our backend port (`3001`) is safe to share on our local Wi-Fi.

1. In the project folder, locate the file named **`Fix_Firewall.bat`**.
2. Right-click the file and select **Run as administrator**.
3. A command window will pop up briefly and close. Your firewall is now configured!

---

## ⚙️ Step 6: Installing Node Modules (Dependencies)

Before launching the server for the first time, we must download the software packages (libraries) that our server uses.

1. In PowerShell, navigate to the backend directory:
   ```powershell
   cd "C:\Users\Alienware\Desktop\Rescue Backup 26-04-2026\system-backend"
   ```
2. Run the install command:
   ```powershell
   npm install
   ```
   *This downloads the required libraries (like Express, SQLite3, and WebSockets) into a folder called `node_modules`. This only needs to be run once.*

---

## ⚡ Step 7: Starting the Server!

Now, you are ready to boot up the system:

1. Inside the `system-backend` folder, start the server by running:
   ```powershell
   npm start
   ```
2. You should see messages in the terminal like:
   ```text
   Rescue Backend running on http://0.0.0.0:3001
   Connected to SQLite DB
   [DB Config] SQLite Write-Ahead Logging (WAL) enabled.
   [Backup] Completed successfully.
   ```
   
* Keep this terminal window open! The server needs to stay running in the background for the applications to work. To close it later, press `Ctrl + C` in the terminal.

---

## 🎮 Step 8: Play and Test!

### On Your Laptop:
1. Open your browser and go to: **`http://localhost:3001/index.html`**.
2. This is the **Portal Hub**. You will see three buttons:
   * **Open ARDMS Command Center**: Opens the web admin control panel where you can monitor incidents on a Leaflet map.
   * **Open ARDMS-Public Support System**: Opens the Citizen App where you can submit mock SOS requests.
   * **Open ARDMS-Rescue Officer App**: Opens the Rescue Officer App where rescuers can accept tasks.

### On Your Mobile Phone:
1. Connect your mobile phone to the **same Wi-Fi** network as your laptop.
2. Open the mobile browser (Chrome/Safari) and type the laptop's Wi-Fi IP address followed by `:3001/index.html`.
   * *Example: `http://192.168.1.4:3001/index.html`*
3. You can now trigger an SOS request on your mobile phone and watch it pop up live on your laptop's Command Center map in real-time!

---

## 🔍 Troubleshooting (If things go wrong)

* **"I get an Infinite Loading Spinner on the mobile app!"**
  * Double check that your phone is on the **exact same Wi-Fi** network as your laptop.
  * Your laptop's IP address might have changed. Run `ipconfig` again and run `python sync_apps.py <NEW_IP>` to update the connection settings.
* **"How do I clean all data and start fresh?"**
  * If the database gets cluttered with mock tests, you can wipe it clean by running this command in the `system-backend` directory:
    ```powershell
    node hard_reset.js
    ```
* **"Command not found: npm or node"**
  * This means Node.js is not installed, or you need to restart your terminal/CMD after installing it so Windows registers the command.
