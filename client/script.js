// By @technoabyss 2021 galaxybra.in
// https://github.com/technoabyss/cytube
// Thank you @PolyCement and @curvebreaker for the original concept!
// Shouts out to boyznite!
//
// This script is designed to be used as the Custom JS on a cytube channel,
// with an accompanying websocket server (see server.js). Tested with Heroku.
// To see and use the admin panel, as well as edit cutouts you must have the
// "Drink calls" permission. I recommend setting that to channel admin only.

const
  WEBSOCKET_ADDR = "wss://tabyss-cytube.herokuapp.com",
  WEBSOCKET_HEARTBEAT = 1000,
  WEBSOCKET_TIMEOUT = 30000 + WEBSOCKET_HEARTBEAT;

/* -------------------------------------------------------------------------- */

const videowrap = document.getElementById("ytapiplayer").parentElement;
let _socket, admin_key;
let initial_state_received = false;
let is_op = false;
let state = {};

// Utils
const createCutout = (image_url) => {
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
  sendState();
};

const setFlipH = phase => {
  let e = document.getElementById("eff_flipH");
  if (phase) { e.classList.add("on"); }
  else e.classList.remove("on");
  if (!state.hasOwnProperty("effects")) state["effects"] = {};
  if (!state["effects"].hasOwnProperty("flipH")) state["flipH"] = false;
  state["effects"]["flipH"] = phase;
  sendState();
};

const setFlipV = phase => {
  let e = document.getElementById("eff_flipV");
  if (phase) { e.classList.add("on"); }
  else e.classList.remove("on");
  if (!state.hasOwnProperty("effects")) state["effects"] = {};
  if (!state["effects"].hasOwnProperty("flipV")) state["flipV"] = false;
  state["effects"]["flipV"] = phase;
  sendState();
};

const initState = () => {
  console.log("Initializing state.", state);
  // let aspect_ratio = (document.querySelector("#videowrap .embed-responsive").classList.contains("embed-responsive-16by9") ? "16by9" : "4by3");

  state = {
    "aspect_ratio": aspect_ratio,
    "effects": {},
    "cutouts": []
  };
};

const receiveState = state => {

  if (!state.hasOwnProperty("aspect_ratio")) state["aspect_ratio"] = "16by9";
  setAspectRatio(state["aspect_ratio"]);

  if (!state.hasOwnProperty("effects")) state["effects"] = {};
  if (!state["effects"].hasOwnProperty("flipH")) state["flipH"] = false;
  setFlipH(state["effects"]["flipH"]);
  if (!state["effects"].hasOwnProperty("flipV")) state["flipV"] = false;
  setFlipV(state["effects"]["flipV"]);

  if (!state.hasOwnProperty("cutouts")) state["cutouts"] = [];
};

const sendState = () => {
  if (!is_op) return;
  console.info("WS - Sending state:");
  console.dir(state);
  _socket.send(JSON.stringify({ key: admin_key, state }));
};

// UI
// General UI manipulation
const setupUI = () => {
  // Effect wrappers
  let
    flipH = document.createElement("div"),
    flipV = document.createElement("div");
  flipH.id = "eff_flipH";
  flipV.id = "eff_flipV";
  flipH.appendChild(flipV);
  videowrap.parentNode.appendChild(flipH);
  flipV.appendChild(videowrap);

  // Cutouts
  let cutouts = document.createElement("div");
  cutouts.id = "cutouts";
  videowrap.appendChild(cutouts);
}
// Admin panel
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
  adminkeyinput.type = "text";
  adminkeyinput.placeholder = "Admin key";
  panel.appendChild(adminkeyform);
  adminkeyform.appendChild(adminkeyinput);

  // You're supposed to enter the admin key, and then hit Enter
  adminkeyform.addEventListener("submit", e => {
    e.preventDefault();
    // Hide the text input
    adminkeyform.hidden = true;
    document.getElementById("admin-controls").disabled = false;
    // Update aspect ratio select
    document.getElementById("admin-aspectratio").value = state["aspect_ratio"];
    // Set the admin key to whatever you typed in
    admin_key = adminkeyinput.value;
    // And broadcast your state to everyone else
    sendState();
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
  fieldset.appendChild(createButton("flipH", "FlipH"));
  document.getElementById("flipH")
    .addEventListener("click", () => setFlipH(!state["effects"]["flipH"]));
  fieldset.appendChild(createButton("flipV", "FlipV"));
  document.getElementById("flipV")
    .addEventListener("click", () => setFlipV(!state["effects"]["flipV"]));

  // Cutouts
  let cutout_form = document.createElement("form")
  fieldset.appendChild(cutout_form);
  let cutout_url = document.createElement("input");
  cutout_url.type = "url";
  cutout_url.id = "cutout_url";
  cutout_url.placeholder = "Image URL";
  cutout_form.appendChild(cutout_url);
  cutout_url.addEventListener("submit", e => {
    e.preventDefault();
    createCutout(cutout.url.value);
  });
};

// Websocket stuff below.
// Whenever the websocket receives data (other than a heartbeat), it passes
// it to receiveState.
const connect = () => {
  _socket = new WebSocket(WEBSOCKET_ADDR);
  let
    connected = false,
    pingTimeout;

  // Heartbeat
  let heartbeat = () => {
    clearTimeout(pingTimeout);
    pingTimeout = setTimeout(socket.close, WEBSOCKET_TIMEOUT);

    setTimeout(() => _socket.send("pong"), WEBSOCKET_HEARTBEAT);
  };

  // Receive message
  _socket.addEventListener("message", e => {
    // Heartbeat
    if (e.data === "ping") return heartbeat();

    console.info("WS - Message:", e.data);

    let new_state = JSON.parse(e.data);

    receiveState(new_state);

    if (!initial_state_received) {
      initial_state_received = true;
      if (Object.entries(new_state).length !== 0) { state = new_state; }
      else initState();
      if (is_op) setupAdminPanel();
    }
  });

  // Connect
  _socket.addEventListener("open", () => {
    console.info("WS - Connected");
    serverMessage("reconnect", "Connected to websocket");
    connected = true;
    heartbeat();
  });

  // Disconnect
  _socket.addEventListener("close", () => {
    if (connected) {
      console.info("WS - Disconnected");
      serverMessage("disconnect", "Disconnected from websocket");
    }
    connected = false;
    connect();
  });
};

// Maybe overdoing it?
const do_setup = () => {
  setupUI();

  is_op = hasPermission("drink");
  // FIXME sometimes it's false when it should be true, probably because this is loading at the wrong time
  console.debug("OP", is_op);

  connect();
};

if (document.readyState === "complete") { do_setup(); }
else window.addEventListener("load", do_setup);
