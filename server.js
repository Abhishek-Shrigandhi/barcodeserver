const express = require("express");
const { createServer } = require("http");
const WebSocket = require("ws");

const PORT = process.env.PORT || 10000;

const app = express();
app.get("/", (req, res) => res.send("WebSocket server running ✅"));

const server = createServer(app);
const wss = new WebSocket.Server({ server });

let pcClient = null; // store the connected PC client

// Heartbeat
function heartbeat() {
  this.isAlive = true;
}

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.isAlive = true;
  ws.on("pong", heartbeat);

  ws.on("message", (msg) => {
    msg = msg.toString();
    console.log("Received:", msg);

    // If PC registers itself
    if (msg === "REGISTER_PC") {
      pcClient = ws; // remember this socket as the PC client
      ws.send("Connected to server as PC client ✅");
      return;
    }

    // Otherwise, assume it's from mobile → forward to PC
    if (pcClient && pcClient.readyState === WebSocket.OPEN) {
      pcClient.send(`From mobile: ${msg}`);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    if (ws === pcClient) {
      pcClient = null; // clear if PC disconnects
    }
  });
});

// Ping clients every 30s
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on("close", () => clearInterval(interval));

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
