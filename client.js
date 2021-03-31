// @technoabyss 2021 galaxybra.in
// Thank you @PolyCement and @curvebreaker for the original!
// Shouts out to boyznite

const {
    address: WEBSOCKET_ADDR,
    timeout: WEBSOCKET_TIMEOUT
  } = require("./settings.json");

let updateState = () => console.log("TODO");

// Websocket stuff below.
// Whenever the websocket receives data (other than a heartbeat), it passes
// it to updateState.
let
  socket,
  connected = false;

let connect = () => {
  socket = new WebSocket(WEBSOCKET_ADDR);
  let pingTimeout;

  // Receive message
  socket.addEventListener("message", e => {
    if (e.data === "ping") return heartbeat();

    console.log("WS: Message: ", e.data);

    updateState(JSON.parse(e.data));
  });

  // Ping
  let heartbeat = () => {
    console.log("WS: Heartbeat");

    clearTimeout(pingTimeout);
    pingTimeout = setTimeout(() => socket.close(), WEBSOCKET_TIMEOUT);

    socket.send("pong");
  }

  // Connect
  socket.addEventListener("open", () => {
    let m = document.createElement("div");
    m.innerText = "Connected to websocket";
    m.className = "server-msg-reconnect";
    document.getElementById("messagebuffer").appendChild(m);

    connected = true;
    heartbeat();
  });

  // Disconnect
  socket.addEventListener("close", () => {
    if (connected) {
      let m = document.createElement("div");
      m.innerText = "Disconnected from websocket";
      m.className = "server-msg-disconnect";
      document.getElementById("messagebuffer").appendChild(m);
    }

    console.log("WS: Connection lost");
    clearTimeout(pingTimeout);
    connected = false;
    connect();
  });
};

connect();
