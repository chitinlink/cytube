const
  WebSocketServer = require("ws").Server,
  port = process.env.PORT || 5000;

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
