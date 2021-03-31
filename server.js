const WebSocket = require("ws");

const WEBSOCKET_PORT = require("./settings.json").port

const server = new WebSocket.Server({ port: WEBSOCKET_PORT });
let sockets = [];

server.on("connection", socket => {
  sockets.push(socket);

  socket.on("message", msg => {
    // TODO
    sockets.forEach(s => s.send(msg));
  });

  socket.on("close", () => sockets = sockets.filter(s => s !== socket));
});
