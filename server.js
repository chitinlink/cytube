const
  http = require("http"),
  { Server } = require("ws");

const
  PORT = process.env.PORT || 3000,
  KEY = process.env.KEY || "";

const server = http.createServer((req, res) => {
  console.info(`${req.method} ${req.url}`);
  res.writeHead(404);
  res.end();
});

server.listen(PORT, () => console.info(`Listening on ${PORT}`));

const wss = new Server({ server });

let state = {};

wss.on("connection", (ws, req) => {
  console.info("Client connected", req.url);

  // Send client current state
  ws.send(JSON.stringify(state));

  ws.on("message", data => {
    // Heartbeat
    if (data == "pong") return ws.send("ping");

    // Actual message
    try { data = JSON.parse(data); }
    catch (e) { console.error("Error:", e); }

    // Confirm key
    if (data.key === KEY) {
      console.info("Received state:", data.state);

      // Update state
      state = data.state;

      // Send to other clients
      [...wss.clients]
        .filter(c => c !== ws)
        .forEach(c => c.send(JSON.stringify(state)));
    } else {
      console.warn("Received message with incorrect key:", data);
    }
  });

  ws.on("close", () => console.info("Client disconnected"));
});
