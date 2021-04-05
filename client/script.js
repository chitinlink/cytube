// By @technoabyss 2021 galaxybra.in
// https://github.com/technoabyss/cytube
// Thank you @PolyCement and @curvebreaker for the original concept!
// Shouts out to boyznite!
//
// To see the UI/move cutouts you must have the "Drink calls" permission.
// I recommend setting that to channel admin only.

const
  WEBSOCKET_ADDR = "wss://your_server_here",
  WEBSOCKET_HEARTBEAT = 1000,
  WEBSOCKET_TIMEOUT = 30000 + WEBSOCKET_HEARTBEAT;

const videowrap = document.getElementById("ytapiplayer").parentElement;

// Utils
const createCutout = (id, image_url) => {
  let
    c = document.createElement("div"),
    e = document.createElement("img");
  c.appendChild(e);
  c.classList.add("cutout");
  c.id = `cutout-${id}`;
  c.style = "--x:0px;--y:0px;";
  e.src = image_url;
  return c;
};

const createButton = (id, text) => {
  let b = document.createElement("button");
  b.classList.add("btn", "btn-sm", "btn-default");
  b.id = id;
  b.innerText = text;
  return b;
};

const createDropdown = (id, options) => {
  let d = document.createElement("select");
  d.id = id;
  options.forEach(o => {
    let op = document.createElement("option");
    op.id = `${id}-${o[0]}`;
    op.value = o[0];
    op.innerText = o[1];
    d.appendChild(op);
  });
  return d;
};

const serverMessage = (type, msg) => {
  let m = document.createElement("div");
  m.className = `server-msg-${type}`;
  m.innerText = msg;
  document.getElementById("messagebuffer").appendChild(m);
  scrollChat();
};

const setAspectRatio = ratio => {
  if (ratio === "16by9") {
    videowrap.classList
      .replace("embed-responsive-4by3", "embed-responsive-16by9");
  } else if (ratio === "4by3") {
    videowrap.classList
      .replace("embed-responsive-16by9", "embed-responsive-4by3");
  } else return console.error("Unknown aspect ratio");


  // // Doing this makes the chat resize to match
  // // this changes the video size if it's already maxed, though
  // CyTube.ui.changeVideoWidth(1);
  // CyTube.ui.changeVideoWidth(-1);

  scrollChat();

  state["aspect_ratio"] = ratio;
  updateState();
};

let state;
const initState = () => {
  let aspect_ratio = (document.querySelector("#videowrap .embed-responsive").classList.contains("embed-responsive-16by9") ? "16by9" : "4by3");

  state = {
    "aspect_ratio": aspect_ratio,
    "cutouts": []
  };
  console.debug(state);
}

const updateState = () => socket.send(JSON.stringify({ key: admin_key, state }));

// UI
const setupAdminPanel = () => {
  // Add context for CSS styles
  document.body.classList.add("admin");

  // Admin Panel
  let panel = document.createElement("div");
  panel.id = "admin-panel";
  document.body.appendChild(panel);

  // Key input
  let adminkeyform = document.createElement("form");
  let adminkeyinput = document.createElement("input");
  // adminkeyinput.id = "adminkey"
  adminkeyinput.type = "text";
  adminkeyinput.placeholder = "Key"
  panel.appendChild(adminkeyform);
  adminkeyform.appendChild(adminkeyinput);
  adminkeyform.addEventListener("submit", () => {
    adminkeyform.hidden = true;
    document.getElementById("admin-controls").disabled = false;
  });

  // Controls
  let fieldset = document.createElement("fieldset");
  fieldset.id = "admin-controls";
  fieldset.disabled = true;
  panel.appendChild(fieldset);

  // Aspect ratios
  fieldset.appendChild(
    createDropdown("admin-aspectratio", [["16by9", "16:9"], ["4by3", "4:3"]])
  );
  document.getElementById("admin-aspectratio")
    .addEventListener("change", e => setAspectRatio(e.target.value));

  // Effects
  // fieldset.appendChild(createButton("flipH", "FlipH"));
  // document.getElementById("flipH")
  //   .addEventListener("click", toggleFlipH);
  // fieldset.appendChild(createButton("flipV", "FlipV"));
  // document.getElementById("flipV")
  //   .addEventListener("click", toggleFlipV);
}

// Websocket stuff below.
// Whenever the websocket receives data (other than a heartbeat), it passes
// it to updateState.
const connect = () => {
  const socket = new WebSocket(WEBSOCKET_ADDR);
  let
    connected = false,
    pingTimeout;

  // Heartbeat
  let heartbeat = () => {
    clearTimeout(pingTimeout);
    pingTimeout = setTimeout(socket.close, WEBSOCKET_TIMEOUT);

    setTimeout(() => socket.send("pong"), WEBSOCKET_HEARTBEAT);
  }

  // Receive message
  socket.addEventListener("message", e => {
    // Heartbeat
    if (e.data === "ping") return heartbeat();

    console.log("WS - Message:", e.data);

    updateState(JSON.parse(e.data));
  });

  // Connect
  socket.addEventListener("open", () => {
    console.log("WS - Connected");
    serverMessage("reconnect", "Connected to websocket");
    connected = true;
    heartbeat();
  });

  // Disconnect
  socket.addEventListener("close", () => {
    if (connected) {
      console.log("WS - Disconnected");
      serverMessage("disconnect", "Disconnected from websocket");
    }
    connected = false;
    connect();
  });
};

// Maybe overdoing it?

console.debug("CLIENT", CLIENT);

const do_setup = () => {
  console.debug("Doing setup");

  const OP = hasPermission("drink");
  console.debug("OP", OP);

  connect();
  initState();
  if (OP) setupAdminPanel();
};

if (document.readyState === "complete") { do_setup() }
else window.addEventListener("load", do_setup);
