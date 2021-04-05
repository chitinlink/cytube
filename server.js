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

  ws.on("message", data => {
    console.debug("Received", data);
    // Heartbeat
    if (data == "pong") return ws.send("ping");

    // Actual message
    try { data = JSON.parse(data); }
    catch (e) { console.error("Error:", e); }

    // Confirm key
    if (data.key === KEY) {
      console.info("Message:", data);

      // Update state
      state = data.state;
      wss.clients.forEach(c => c.send(JSON.stringify(state)));
    } else console.warning("Received message with incorrect key:", data);
  });

  ws.on("close", () => console.info("Client disconnected"));
});
