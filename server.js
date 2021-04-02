const
  http = require("http"),
  { Server } = require("ws");

const
  PORT = process.env.PORT || 3000,
  KEY = process.env.KEY || "";

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  res.writeHead(404);
  res.end();
});

server.listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new Server({ server });

wss.on("connection", (ws, req) => {
  console.log("Client connected", req.url);

  ws.on("message", data => {
    try { data = JSON.parse(data); }
    catch (e) { console.log("Error:", e); }

    if (data.key === KEY) {
      console.log("Message:", data);
      // TODO
    } else {
      console.log("Received message with incorrect key:", data);
    }

  });

  ws.on("close", () => console.log("Client disconnected"));
});
