const { Server } = require("ws");

const port = 443;

const server = new Server({ port });

let clients = [];

server.on("connection", socket => {
  clients.push(socket);

  socket.on("message", msg => {
    // TODO
    clients.forEach(s => s.send(msg));
  });

  socket.on("close", () => clients = clients.filter(s => s !== socket));
});
