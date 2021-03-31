const WebSocketServer = require("ws").Server;

const WEBSOCKET_PORT = 8080;

const server = new WebSocketServer({ port: WEBSOCKET_PORT });
let sockets = [];

server.on("connection", socket => {
  sockets.push(socket);

  socket.on("message", msg => {
    // TODO
    sockets.forEach(s => s.send(msg));
  });

  socket.on("close", () => sockets = sockets.filter(s => s !== socket));
});
