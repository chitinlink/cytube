const
  WebSocketServer = require("ws").Server,
  http = require("http"),
  express = require("express"),
  app = express(),
  port = process.env.PORT || 5000;

app.use(express.static(__dirname + "/"))
const server = http.createServer(app)
server.listen(port)

const server = new WebSocketServer({ server });
let sockets = [];

server.on("connection", socket => {
  sockets.push(socket);

  socket.on("message", msg => {
    // TODO
    sockets.forEach(s => s.send(msg));
  });

  socket.on("close", () => sockets = sockets.filter(s => s !== socket));
});
