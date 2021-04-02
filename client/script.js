// @technoabyss 2021 galaxybra.in
// Thank you @PolyCement and @curvebreaker for the original!
// Shouts out to boyznite

const
  WEBSOCKET_ADDR = "wss://your_server_here",
  WEBSOCKET_KEY = "YOUR_KEY_HERE",
  WEBSOCKET_HEARTBEAT = 1000,
  WEBSOCKET_TIMEOUT = 30000 + WEBSOCKET_HEARTBEAT;

let createCutout = (image_url, name) => {
  let e = document.createElement("img");
  e.src = image_url;
  e.classList.add("cutout");
  e.id = `cutout-${name}`;
  return e;
};

let updateState = data => {
  //TODO
};

// Websocket stuff below.
// Whenever the websocket receives data (other than a heartbeat), it passes
// it to updateState.
let connect = () => {
  const socket = new WebSocket(WEBSOCKET_ADDR);
  let connected = false;

  // Heartbeat
  let heartbeat = () => {
    console.log("WS - Heartbeat");

    clearTimeout(pingTimeout);
    pingTimeout = setTimeout(() => socket.close(), WEBSOCKET_TIMEOUT);

    setTimeout(() => socket.send("pong"), WEBSOCKET_HEARTBEAT);
  }

  // Receive message
  socket.addEventListener("message", e => {
    // Heartbeat
    if (e === "ping") return heartbeat();

    console.log("WS - Message:", e.data);

    updateState(JSON.parse(e.data));
  });

  // Connect
  socket.addEventListener("open", () => {
    console.log("WS - Connected");

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
      console.log("WS - Connection lost");

      let m = document.createElement("div");
      m.innerText = "Disconnected from websocket";
      m.className = "server-msg-disconnect";
      document.getElementById("messagebuffer").appendChild(m);
    }

    connected = false;
    connect();
  });

  // Error
  socket.addEventListener("error", e => {
    console.log("WS - Error:", e);

    let m = document.createElement("div");
    m.innerText = e;
    m.className = "server-msg-disconnect";
    document.getElementById("messagebuffer").appendChild(m);
  })
};

connect();
