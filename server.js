// const express = require("express");
// const { WebSocketServer } = require("ws");

// const app = express();
// const PORT = process.env.PORT || 8080;


// const path = require('path');
// const fs = require('fs');

// // HTTP server for Render
// const server = app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

const WebSocket = require('ws');
const wss = new WebSocket.Server({ host: '0.0.0.0', port: 8080 });

// WebSocket server
// const wss = new WebSocketServer({ server });

let pcClient = null; // store PC connection

wss.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('message', (message) => {
     message = message.toString();
    console.log('Received barcode data:', message);

    // First message "REGISTER_PC" marks this as the PC client
    if (msg === "REGISTER_PC") {
      pcClient = ws;
      ws.send("PC registered");
    } else {
      // Forward all other messages to PC if available
      if (pcClient && pcClient.readyState === WebSocket.OPEN) {
        pcClient.send(msg);
      }
    }
    // simulateKeyboardInput(message);
  });

  socket.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log(`WebSocket server running on port ${PORT}`);


// Function to simulate keyboard input using AutoHotkey
const { exec } = require('child_process');
const simulateKeyboardInput = (barcodeData) => {
  const ahkScript = `
    SendInput ${barcodeData}
  `;
  // Check if the app is running as a packaged executable
  const isPackaged = process.pkg !== undefined;

  // Use the correct path based on whether it's packaged or not
  let ahkFilePath;
  let exePath;
  if (isPackaged) {
    // In the packaged version, the file is inside the extracted folder
    ahkFilePath = path.join(process.cwd(), 'assets', 'temp.ahk');
    exePath = path.join(process.cwd(), 'assets', 'AutoHotkey.exe');
  } else {
    // In development, the file is inside the current directory's assets folder
    ahkFilePath = path.join(__dirname, 'assets', 'temp.ahk');
    exePath = path.join(__dirname, 'assets', 'AutoHotkey.exe');
  }

  // Ensure the assets directory exists if not packaged (for development)
  if (!fs.existsSync(path.dirname(ahkFilePath))) {
    fs.mkdirSync(path.dirname(ahkFilePath), { recursive: true });
  }

  // Ensure the executable exists before trying to run it
  if (!fs.existsSync(exePath)) {
    console.error(`Executable not found at: ${exePath}`);
    process.exit(1);
  }

  fs.writeFileSync(ahkFilePath, ahkScript); // Save the script to a file

  const command = exePath + ' ' + ahkFilePath

  exec(command, (err, stdout, stderr) => {
    // '"C:\\Program Files\\AutoHotkey\\AutoHotkey.exe" temp.ahk'  --> working line if program installed
    if (err) {
      console.error('Error executing AutoHotkey script:', err);
      return;
    }
    console.log('Keyboard input simulated');
  });
};