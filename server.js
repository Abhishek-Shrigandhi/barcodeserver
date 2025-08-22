const express = require("express");
const { createServer } = require("http");
const WebSocket = require("ws");

const PORT = process.env.PORT || 10000;

const app = express();

// Health check route (Render needs this!)
app.get("/", (req, res) => res.send("WebSocket server running ✅"));

const server = createServer(app);
const wss = new WebSocket.Server({ server });

// Heartbeat for keepalive
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

    if (msg === "REGISTER_PC") {
      ws.send("Connected to server as PC client ✅");
    } else {
      ws.send(`Echo: ${msg}`);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
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
