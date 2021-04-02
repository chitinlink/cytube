const
  express = require("express"),
  { Server } = require("ws");

const
  INDEX = "/index.html",
  PORT = process.env.PORT || 3000,
  KEY = process.env.KEY || "";

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new Server({ server });
let clients = [];

wss.on("connection", ws => {
  console.log("url: ", ws.url);
  console.log("Client connected");

  ws.on("message", data => {
    // Heartbeat
    if (data == "pong") ws.send("ping");

    //TODO
  });

  ws.on("close", () => console.log("Client disconnected"));
});
