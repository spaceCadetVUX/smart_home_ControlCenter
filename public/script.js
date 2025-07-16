// authentication
let isEditingApi = false;
let isEditingPassword = false;
function saveInfo() {
  const apiInput = document.getElementById("api");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const api = apiInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;

  if (!email || !password) {
    alert("Please fill out all required fields.");
    return;
  }

  // Save new API only if typed
  if (api) {
    localStorage.setItem("api", api);
    apiInput.value = "";
    isEditingApi = false;
  }

  localStorage.setItem("email", email);
  localStorage.setItem("password", password);
  isEditingPassword = false;

  updateUIAfterSave();
  alert("Information saved successfully!");
}

function toggleApi() {
  const input = document.getElementById("api");
  input.type = input.type === "password" ? "text" : "password";
}

function togglePassword() {
  const input = document.getElementById("password");
  input.type = input.type === "password" ? "text" : "password";
}

function updateUIAfterSave() {
  // Hide eye icons
  document.getElementById("toggleApi").style.display = "none";
  document.getElementById("togglePassword").style.display = "none";

  // Mask password and API input
  document.getElementById("password").type = "password";
  document.getElementById("api").type = "password";

  // Show API saved notice
  updateApiNotice();
}

function updateApiNotice() {
  const notice = document.getElementById("apiNotice");
  const savedApi = localStorage.getItem("api");
  notice.textContent = savedApi ? "****** (API saved)" : "";
}

window.onload = async function () {
  const savedEmail = localStorage.getItem("email");
  const savedPassword = localStorage.getItem("password");
  const savedApi = localStorage.getItem("api");
  const consoleEl = document.getElementById("console");
  if (savedEmail) document.getElementById("email").value = savedEmail;
  if (savedPassword) document.getElementById("password").value = savedPassword;
  updateApiNotice();
  document.getElementById("api").addEventListener("input", () => {
    isEditingApi = true;
    document.getElementById("toggleApi").style.display = "inline";
  });
  document.getElementById("password").addEventListener("input", () => {
    isEditingPassword = true;
    document.getElementById("togglePassword").style.display = "inline";
  });
  document.getElementById("toggleApi").style.display = "none";
  document.getElementById("togglePassword").style.display = "none";
  if (savedApi && savedEmail && savedPassword) {
    await startSessionAndWebSocket();  // ✅ use the async wrapper
  } else {
    consoleEl.textContent = "❌ Missing credentials. Please save API, Email, and Password.";
  }
};

// 🧠 Console Logger
function logToConsole(message, data = null) {
  const consoleEl = document.getElementById("consoleContent");
  const line = document.createElement("div");
  line.textContent = data ? `${message}: ${JSON.stringify(data)}` : message;
  consoleEl.appendChild(line);
  consoleEl.scrollTop = consoleEl.scrollHeight;
}

let sessionDataToStore = null;
let deviceInfo = null; // 🌐 Global deviceInfo
let socket = null;
const wire = 1;
const SESSION_VALIDITY_MS = 1000 * 60 * 30; // 30 minutes
// 📡 Get Casambi Session
async function getCasambiSession(force = false) {
  const api = localStorage.getItem("api");
  const email = localStorage.getItem("email");
  const password = localStorage.getItem("password");

  if (!api || !email || !password) {
    logToConsole("❌ Missing API/Email/Password. Please save first.");
    return;
  }
  const localSession = JSON.parse(localStorage.getItem("sessionData") || "{}");
  // ✅ Use cached session if still valid
  if (!force && localSession.sessionId && Date.now() - localSession.timestamp < SESSION_VALIDITY_MS) {
    sessionDataToStore = localSession;
    logToConsole("✅ Using cached session.");

    const { networkId, fullData } = localSession;
    deviceInfo = fullData ? fullData[networkId] : null; // ✅ assign to global

    if (deviceInfo) {
      const { id, address, name } = deviceInfo;

      logToConsole("🧩 Cached Device Info");
      logToConsole(`Session ID: ${localSession.sessionId}`);
      logToConsole(`Network ID: ${networkId}`);
      logToConsole(`Device ID: ${id}`);
      logToConsole(`Address: ${address}`);
      logToConsole(`Name: ${name}`);
    } else {
      logToConsole("⚠️ No device info available in cached session.");
    }

    return;
  }

  // ✅ Fetch a new session if forced or expired
  try {
    const res = await fetch("/getSession", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api, email, password })
    });
    if (!res.ok) {
      const errorText = await res.text();
      logToConsole("❌ Error getting session", errorText);
      return;
    }
    const data = await res.json();
    const networkId = Object.keys(data)[0];
    deviceInfo = data[networkId]; // ✅ assign to global
    const sessionId = deviceInfo.sessionId;
    const { id, address, name } = deviceInfo;
    sessionDataToStore = {
      sessionId,
      networkId,
      timestamp: Date.now(),
      fullData: data
    };
    localStorage.setItem("sessionData", JSON.stringify(sessionDataToStore));
    logToConsole("✅ New session stored.");
    logToConsole("🧩 New Device Info");
    logToConsole(`Session ID: ${sessionId}`);
    logToConsole(`Network ID: ${networkId}`);
    logToConsole(`Device ID: ${id}`);
    logToConsole(`Address: ${address}`);
    logToConsole(`Name: ${name}`);
  } catch (err) {
    logToConsole("⚠️ Failed to fetch session", err.message);
  }
}

let messageLog = []; // 🧾 Stores only the latest relevant message
// 🔌 WebSocket Connection
function initCasambiWebSocket() {
  const api_key = localStorage.getItem("api");
  if (!sessionDataToStore || !api_key) {
    logToConsole("❌ Cannot open WebSocket. Missing session or API key.");
    return;
  }

  const session_id = sessionDataToStore.sessionId;
  const network_id = sessionDataToStore.networkId;

  if (!socket) {
    socket = new WebSocket("wss://door.casambi.com/v1/bridge/", api_key);
    logToConsole("🔌 Connecting to Casambi WebSocket...");

    socket.onopen = function () {
      logToConsole("✅ WebSocket connected.");
      sendWireOpenMessage(network_id, session_id);
    };

    socket.onmessage = function (msg) {
      new Response(msg.data).text().then(result => {
        const data = JSON.parse(result);
        handleNewMessage(data); // ✅ Process the incoming message
      }).catch(err => {
        logToConsole("❌ Parse error", err);
      });
    };

    socket.onerror = function (err) {
      logToConsole("❗ WebSocket error", err);
      socket = null;
      setTimeout(() => initCasambiWebSocket(), 2000);
    };

    socket.onclose = function () {
      logToConsole("🔌 WebSocket closed.");
      socket = null;
      setTimeout(() => initCasambiWebSocket(), 2000);
    };
  }
}

// 🧠 Handle new message
function handleNewMessage(data) {
  // ✅ Only log and store if it's a "unitChanged" type (or similar expected structure)
  if (data.method === "unitChanged" && data.address && data.controls) {
    messageLog.length = 0;      // 🔄 Clear previous
    messageLog.push(data);      // ✅ Store latest
    logToConsole("🧾 Latest Message Log", messageLog);
    logToConsole("🆔 Latest message ID", data.id ?? "N/A");
  }
    // 🟢 Update Red slider value from message
  updateSlidersFromMessageLog();
  // ✅ Handle system-level events regardless
  if (data.wireStatus === "openWireSucceed") {
    logToConsole("🔓 Wire opened successfully.");
    sendPingMessage();
  } else if (data.response === "pong") {
    logToConsole("🏓 Pong received.");
  } else if (data.method === "peerChanged" && !data.online) {
    logToConsole("⚠️ Peer offline");
  }
}

// Get the latest ID (Unit ID)   just call 
function getLatestMessageId() {
  if (messageLog.length > 0 && messageLog[0].id !== undefined) {
    return messageLog[0].id;
  } else {
    return "No ID available";
  }
}
// show unit ID - button event
document.getElementById("showIdBtn").addEventListener("click", () => {
  const id = getLatestMessageId();
  logToConsole(id); // ✅ Only shows: 4 (no label or emoji)
});

// show all mess log - button event
document.getElementById("showAllMessagesBtn").addEventListener("click", () => {
  logToConsole("📄 Current MessageLog", messageLog);
});



function updateSlidersFromMessageLog() {
  const controlMap = {
    R: { sliderId: "redSlider", valueId: "redValue" },
    G: { sliderId: "greenSlider", valueId: "greenValue" },
    B: { sliderId: "blueSlider", valueId: "blueValue" },
    T: { sliderId: "tempSlider", valueId: "tempValueT" },
    W: { sliderId: "whiteSlider", valueId: "whiteValue" }
  };

  if (messageLog.length === 0) return;

  const controls = messageLog[0].controls;
  if (!Array.isArray(controls)) return;

  controls.forEach(control => {
    const label = control.label;
    const match = controlMap[label];
    if (match) {
      const slider = document.getElementById(match.sliderId);
      const valueDisplay = document.getElementById(match.valueId);
      if (slider && valueDisplay) {
        const rounded = Math.round(control.value);
        slider.value = rounded;
        valueDisplay.textContent = rounded;
      }
    }
  });
}


function getRedControl() {
  if (messageLog.length === 0) return null;
  const controls = messageLog[0].controls;
  if (!Array.isArray(controls)) return null;
  return controls.find(control => control.label === "R");
}




// testing btn
document.getElementById("testing").addEventListener("click", () => {
  const redControl = getRedControl();
  logToConsole("🔴 Red Control:", redControl);

});















// 🔓 Wire Open
function sendWireOpenMessage(network_id, session_id) {
  const data = {
    method: "open",
    id: network_id,
    session: session_id,
    ref: "casambi-ref",
    wire: wire,
    type: 1
  };
  socket.send(JSON.stringify(data));
  logToConsole("📤 Sent wire open.");
}

// 🏓 Ping
function sendPingMessage() {
  const data = {
    wire: wire,
    method: "ping"
  };
  socket.send(JSON.stringify(data));
  logToConsole("📤 Sent ping.");
}

// 👆 Connect Button Handler
document.getElementById("connectBtn").addEventListener("click", async (e) => {
  logToConsole("🔄 Getting session and connecting...");

  await getCasambiSession(); // 👈 This fetches or restores the session

  // ✅ Print the sessionDataToStore to your custom console
  logToConsole("📦 Session Data", sessionDataToStore);

  // ✅ Then connect to Casambi WebSocket
  initCasambiWebSocket();

  // Optional: disable button after connecting
  // e.target.disabled = true;
  // e.target.textContent = "✅ Connected";
});













function toggleConsole() {
  const consoleEl = document.getElementById("console");
  if (consoleEl.style.display === "none") {
    consoleEl.style.display = "block";
  } else {
    consoleEl.style.display = "none";
  }
}


// Make the console draggable
// (function makeConsoleDraggable() {
//   const el = document.getElementById("console");
//   let offsetX = 0, offsetY = 0;
//   let isDragging = false;

//   el.addEventListener("mousedown", (e) => {
//     // Don't drag if user is selecting text
//     const selection = window.getSelection();
//     if (selection && selection.toString().length > 0) return;

//     isDragging = true;
//     offsetX = e.clientX - el.offsetLeft;
//     offsetY = e.clientY - el.offsetTop;
//     document.body.style.userSelect = "none";
//   });

//   document.addEventListener("mouseup", () => {
//     isDragging = false;
//     document.body.style.userSelect = "auto";
//   });

//   document.addEventListener("mousemove", (e) => {
//     if (!isDragging) return;
//     el.style.left = (e.clientX - offsetX) + "px";
//     el.style.top = (e.clientY - offsetY) + "px";
//     el.style.right = "auto"; // enable horizontal movement
//   });
// })();


// send control function
function sendControl(label, value) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    logToConsole("❌ WebSocket not connected.");
    return;
  }
  const unitId = getLatestMessageId(); // assumes ID from message
  if (!unitId || unitId === "No ID available") {
    logToConsole("⚠️ No valid unit ID.");
    return;
  }
  const controlMsg = {
    wire,
    method: "controlUnit",
    id: unitId,
    targetControls: {
      [label]: { value: value }
    }
  };
  socket.send(JSON.stringify(controlMsg));
  logToConsole(`🎛️ Sent ${label} = ${value}`);
}

["R", "G", "B", "T", "W"].forEach(label => {
  const sliderId = {
    R: "redSlider",
    G: "greenSlider",
    B: "blueSlider",
    T: "tempSlider",
    W: "whiteSlider"
  }[label];

  const slider = document.getElementById(sliderId);
  if (slider) {
    slider.addEventListener("input", () => {
      const val = parseInt(slider.value);
      sendControl(label, val);
    });
  }
});



/* Add event listeners to all switch inputs to log device status changes */
document.querySelectorAll('.switch input').forEach(input => {
  input.addEventListener('change', function() {
    const card = this.closest('.control-card');
    const device = card.querySelector('h3').textContent;
    console.log(`${device} is now ${this.checked ? 'ON' : 'OFF'}`);
  });
});



// date time - updating 
const dateElement = document.getElementById("currentDate");
const now = new Date();
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
const formattedDate = now.toLocaleDateString(undefined, options);
dateElement.textContent = formattedDate;



// toggle the sidebar for mobile site
const toggleBtn = document.getElementById('toggleSidebar');
const sidebar = document.getElementById('sidebar');
toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('hidden');
    toggleBtn.innerHTML = sidebar.classList.contains('hidden') ? '&gt;' : '&lt;';
});
/* Mapping between button label and corresponding class */
const roomClassMap = {
  'living': 'living-room',
  'dining': 'dining-room',
  'kitchen': 'kitchen-room',
  'bedroom': 'bedroom-room',
  'garage': 'garage-room',
  'setting': 'setting-part'
};
// sidebar selection
/* Add event listeners to nav buttons to handle active state and switch room views */
document.querySelectorAll('nav button').forEach(button => {
  button.addEventListener('click', function() {
    // Update active class
    document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');

    // Hide all control cards
    document.querySelectorAll('.control-card').forEach(card => card.style.display = 'none');

    // Determine the selected room
    const buttonText = this.textContent.toLowerCase();
    for (const room in roomClassMap) {
      if (buttonText.includes(room)) {
        const targetClass = roomClassMap[room];
        document.querySelectorAll(`.control-card.${targetClass}`).forEach(card => {
          card.style.display = 'block';
        });
        console.log(`Switched to ${room} room`);
        break;
      }
    }
  });
});
/* Auto-trigger default room (e.g., Living Room) on page load */
document.querySelector('nav button.active')?.click();




// Store lamp states
// ...existing code...
const lampStates = {
  // Living Room
  'celling-lamp-lv': { name: "Ceiling LampA", status: "on", temp: 1000, dim: 50, tempMin: 2700, tempMax: 16000, tempStep: 1, hue: 0, saturation: 0 },
  'floor-lamp-lv': { name: "Floor Lamp", status: "off", temp: 2700, dim: 60, tempMin: 2700, tempMax: 3000, tempStep: 1, hue: 0, saturation: 0 },
  'Table-Lamp-lv': { name: "Table Lamp", status: "off", temp: 2700, dim: 70, tempMin: 2700, tempMax: 3000, tempStep: 1, hue: 0, saturation: 0 },
  'Accent-Light-lv': { name: "Accent Light", status: "off", temp: 2700, dim: 70, tempMin: 2700, tempMax: 3000, tempStep: 1, hue: 0, saturation: 0 },

  // Dining Room
  'chandelier-Dining': { name: "Chandelier", status: "off", temp: 2700, dim: 70, tempMin: 2700, tempMax: 3000, tempStep: 1, hue: 0, saturation: 0 },
  'Wall-Sconce-Dining': { name: "Wall Sconce", status: "off", temp: 2700, dim: 70, tempMin: 2700, tempMax: 3000, tempStep: 1, hue: 0, saturation: 0 },

  // Kitchen
  'Recessed-Light-kitchen': { name: "Recessed Light", status: "off", temp: 3000, dim: 70, tempMin: 3000, tempMax: 4000, tempStep: 1, hue: 0, saturation: 0 },
  'Cabinet-Light-kitchen': { name: "Cabinet Light", status: "off", temp: 3000, dim: 70, tempMin: 3000, tempMax: 4000, tempStep: 1, hue: 0, saturation: 0 },
  'Pendant-Light-kitchen': { name: "Pendant Light", status: "off", temp: 3000, dim: 70, tempMin: 3000, tempMax: 4000, tempStep: 1, hue: 0, saturation: 0 },
  'Track-Light-kitchen': { name: "Track Light", status: "off", temp: 3000, dim: 70, tempMin: 3000, tempMax: 4000, tempStep: 1, hue: 0, saturation: 0 },

  // Bedroom
  'Ceiling-Light-Bed': { name: "Ceiling Light", status: "off", temp: 3000, dim: 70, tempMin: 3000, tempMax: 4000, tempStep: 1, hue: 0, saturation: 0 },
  'Bedside-Lamp-Bed': { name: "Bedside Lamp", status: "off", temp: 3000, dim: 70, tempMin: 3000, tempMax: 4000, tempStep: 1, hue: 0, saturation: 0 },
  'Smart-Light-Bed': { name: "Smart Light", status: "off", temp: 3000, dim: 70, tempMin: 3000, tempMax: 4000, tempStep: 1, hue: 0, saturation: 0 },

  // Garage
  'LED-Ceiling-garage': { name: "LED Ceiling", status: "off", temp: 5000, dim: 70, tempMin: 4000, tempMax: 6500, tempStep: 1, hue: 0, saturation: 0 },
  'otion-Sensor-garage': { name: "Motion Sensor", status: "off", temp: 5000, dim: 70, tempMin: 4000, tempMax: 6500, tempStep: 1, hue: 0, saturation: 0 },
  'Task-Lighting-garage': { name: "Task Lighting", status: "off", temp: 5000, dim: 70, tempMin: 4000, tempMax: 6500, tempStep: 1, hue: 0, saturation: 0 }
};
//

window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('input[type="checkbox"][data-id]').forEach(input => {
    const lampId = input.getAttribute('data-id');
    if (lampStates[lampId]) {
      input.checked = lampStates[lampId].status === "on";
    }
  });
});


//ac
document.addEventListener("DOMContentLoaded", () => {
  // Temperature range
  const tempRange = document.getElementById("tempRange");
  const tempValue = document.getElementById("tempValue");
  if (tempRange && tempValue) {
    tempRange.addEventListener("input", () => {
      tempValue.textContent = tempRange.value;
    });
  }

  // Humidity range
  const humidRange = document.getElementById("humidRange");
  const humidValue = document.getElementById("humidValue");
  if (humidRange && humidValue) {
    humidRange.addEventListener("input", () => {
      humidValue.textContent = humidRange.value;
    });
  }

  // Fan speed buttons
  const fanButtons = document.querySelectorAll(".fan-btn");
  fanButtons.forEach(button => {
    button.addEventListener("click", function () {
      fanButtons.forEach(btn => btn.classList.remove("active"));
      this.classList.add("active");
      console.log("Fan Speed:", this.dataset.speed);
    });
  });

  // Swing toggle
  const swingToggle = document.getElementById("swingToggle");
  const swingState = document.getElementById("swingState");
  if (swingToggle && swingState) {
    swingToggle.addEventListener("change", () => {
      const swingText = swingToggle.checked ? "On" : "Off";
      swingState.textContent = swingText;
      console.log("Swing is", swingText);
    });
  }

  // Date & Time updater
  const dateTimeDisplay = document.getElementById("current-datetime");
  function updateDateTime() {
    const now = new Date();
    const formatted =
      now.toLocaleDateString("en-CA") + " " + now.toLocaleTimeString("en-GB");
    if (dateTimeDisplay) dateTimeDisplay.textContent = formatted;
  }
  updateDateTime();
  setInterval(updateDateTime, 1000);

  // AC Power toggle
  const acPowerToggle = document.getElementById("acPowerToggle");
  const acStateText = document.getElementById("acState");

  if (acPowerToggle && acStateText) {
    acPowerToggle.addEventListener("change", () => {
      const isOn = acPowerToggle.checked;
      acStateText.textContent = isOn ? "On" : "Off";

      // Enable/Disable all controls
      if (tempRange) tempRange.disabled = !isOn;
      if (humidRange) humidRange.disabled = !isOn;
      if (swingToggle) swingToggle.disabled = !isOn;

      fanButtons.forEach(btn => {
        btn.disabled = !isOn;
        btn.style.opacity = isOn ? "1" : "0.5";
      });
    });
  }
});


//shutter (blind)
const slider = document.getElementById("blindSlider");   // slider
const sliderValue = document.getElementById("sliderValue");   // // check posistion
const openBtn = document.getElementById("openBtn");
const closeBtn = document.getElementById("closeBtn");
const blindSelector = document.getElementById("blindSelector");     // options
const selectAllSwitch = document.getElementById("selectAllSwitch");  // slect all blinds

const blindStates = {
  living_blind_1: 100,
  living_blind_2: 50,
  living_blind_3: 50,
  living_blind_4: 50,
  living_blind_5: 50,
  living_blind_6: 50,
  living_blind_7: 50
};

let animationFrame = null;

// Update the visible slider and background
function updateSliderUI(value) {
  sliderValue.textContent = value;
  slider.style.background = `linear-gradient(to right, #007bff ${value}%, #e0e0e0 ${value}%)`;
}

// Animate the actual visible slider knob smoothly
function animateSliderKnob(from, to) {
  let current = from;

  function step() {
    const difference = to - current;

    if (Math.abs(difference) < 0.5) {
      current = to;
      slider.value = Math.round(current);
      updateSliderUI(Math.round(current));
      return;
    }
    current += difference * 0.01;
    const rounded = Math.round(current);
    slider.value = rounded;
    updateSliderUI(rounded);

    animationFrame = requestAnimationFrame(step);
  }
  animationFrame = requestAnimationFrame(step);
}
// Animate all blinds or a selected one
function animateSliderTo(target) {
  cancelAnimationFrame(animationFrame);

  if (selectAllSwitch.checked) {
    Object.keys(blindStates).forEach(key => {
      blindStates[key] = target; // instant state update, or you can animate per-blind if needed
    });

    // Use average value of all blinds as "from"
    const avg =
      Object.values(blindStates).reduce((a, b) => a + b, 0) /
      Object.values(blindStates).length;
    animateSliderKnob(parseInt(slider.value), target);
  } else {
    const selected = blindSelector.value;
    const from = blindStates[selected];
    blindStates[selected] = target;
    animateSliderKnob(from, target);
  }
}
// Manual slider drag
slider.addEventListener("input", function () {
  const value = parseInt(this.value);
  if (selectAllSwitch.checked) {
    Object.keys(blindStates).forEach(key => {
      blindStates[key] = value;
    });
  } else {
    const selected = blindSelector.value;
    blindStates[selected] = value;
  }
  updateSliderUI(value);
});
// Open/Close buttons
openBtn.addEventListener("click", () => animateSliderTo(100));
closeBtn.addEventListener("click", () => animateSliderTo(0));
// Blind selection change
blindSelector.addEventListener("change", () => {
  if (!selectAllSwitch.checked) {
    const selected = blindSelector.value;
    const value = blindStates[selected];
    slider.value = value;
    updateSliderUI(value);
  }
});

// Select All toggle
selectAllSwitch.addEventListener("change", () => {
  if (selectAllSwitch.checked) {
    const avg =
      Object.values(blindStates).reduce((a, b) => a + b, 0) /
      Object.values(blindStates).length;
    slider.value = Math.round(avg);
    updateSliderUI(Math.round(avg));
  } else {
    const selected = blindSelector.value;
    const value = blindStates[selected];
    slider.value = value;
    updateSliderUI(value);
  }
});
// Initial setup
slider.value = blindStates[blindSelector.value];
updateSliderUI(slider.value);
// Initialize on load  of dating 



// modal
const modal = document.getElementById("universal-modal");
const modalCloseBtn = document.getElementById("modal-close");

const modalTempSlider = document.getElementById("modal-temp-slider");
const modalDimSlider = document.getElementById("modal-dim-slider");

const modalTempValue = document.getElementById("modal-temp-value");
const modalDimValue = document.getElementById("modal-dim-value");

const modalHueSlider = document.getElementById("modal-hue-slider");
const modalSaturationSlider = document.getElementById("modal-saturation-slider");

const modalHueValue = document.getElementById("modal-hue-value");
const modalSaturationValue = document.getElementById("modal-saturation-value");



// --- Persistent Lamp Name Storage ---
function saveLampNamesToStorage() {
  const lampNames = {};
  Object.keys(lampStates).forEach(id => {
    lampNames[id] = lampStates[id].name || '';
  });
  localStorage.setItem('lampNames', JSON.stringify(lampNames));
}

function loadLampNamesFromStorage() {
  const lampNames = JSON.parse(localStorage.getItem('lampNames') || '{}');
  Object.keys(lampNames).forEach(id => {
    if (lampStates[id]) lampStates[id].name = lampNames[id];
  });
}

// Call this on page load
window.addEventListener('DOMContentLoaded', () => {
  loadLampNamesFromStorage();
  Object.entries(lampStates).forEach(([id, state]) => {
    const card = document.querySelector(`.gear-icon[data-id="${id}"]`)?.closest('.control-card');
    if (card) {
      const h3 = card.querySelector('h3');
      if (h3 && state.name) {
        // Only change the text node, not the gear icon
        h3.childNodes[0].textContent = state.name + ' ';
      }
    }
  });
});

// --- Modal logic ---
let currentLampId = null;

document.querySelectorAll('.gear-icon').forEach(icon => {
  icon.addEventListener('click', function () {
    currentLampId = this.getAttribute('data-id');
    const lamp = lampStates[currentLampId];
    if (!lamp) return;

    // Set lamp name input value
    document.getElementById('modal-lamp-name-input').value = lamp.name || getLampCardName(currentLampId);

    //  Set dynamic range for temp
    modalTempSlider.min = lamp.tempMin;
    modalTempSlider.max = lamp.tempMax;
    modalTempSlider.step = lamp.tempStep;

    // Load values
    modalTempSlider.value = lamp.temp;
    modalDimSlider.value = lamp.dim;
    modalTempValue.textContent = lamp.temp;
    modalDimValue.textContent = lamp.dim;
    modalHueSlider.value = lamp.hue;
    modalSaturationSlider.value = lamp.saturation;
    modalHueValue.textContent = lamp.hue;
    modalSaturationValue.textContent = lamp.saturation + "%";

    // Show modal
    modal.style.display = 'block';
    requestAnimationFrame(() => modal.classList.add('show'));
  });
});

function getLampCardName(lampId) {
  const lampCard = document.querySelector(`.gear-icon[data-id="${lampId}"]`)?.closest('.control-card');
  const h3 = lampCard?.querySelector('h3');
  return h3 ? h3.childNodes[0].textContent.trim() : '';
}

// Close modal
modalCloseBtn.addEventListener('click', () => {
  modal.classList.remove('show');
  setTimeout(() => modal.style.display = 'none', 500);
});

document.getElementById('changeLampNameBtn').addEventListener('click', function () {
  if (!currentLampId) return;
  let newName = document.getElementById('modal-lamp-name-input').value.trim();
  if (!newName) return;

  // Limit name to 16 characters (including spaces)
  if (newName.length > 16) {
    alert("Lamp name cannot exceed 16 characters.");
    newName = newName.substring(0, 16);
    document.getElementById('modal-lamp-name-input').value = newName; // update input field
    return; // Stop further processing
  }

  // Update lampStates and save to localStorage
  lampStates[currentLampId].name = newName;
  saveLampNamesToStorage();

  // Update the card's h3 text
  const lampCard = document.querySelector(`.gear-icon[data-id="${currentLampId}"]`)?.closest('.control-card');
  if (lampCard) {
    const h3 = lampCard.querySelector('h3');
    if (h3) {
      h3.childNodes[0].textContent = newName + ' ';
    }
  }
});


modalTempSlider.addEventListener('input', () => {
  const value = parseInt(modalTempSlider.value);
  modalTempValue.textContent = value;

  if (currentLampId) {
    lampStates[currentLampId].temp = value;

    const card = document.querySelector(`.gear-icon[data-id="${currentLampId}"]`)?.closest('.control-card');
    if (card) {
      card.querySelector('.temp-value').textContent = value;
    }

    sendLampUpdate(currentLampId); // debounced, feels real-time
  }
});

modalDimSlider.addEventListener('input', () => {
  const value = parseInt(modalDimSlider.value);
  modalDimValue.textContent = value;

  if (currentLampId) {
    lampStates[currentLampId].dim = value;

    const card = document.querySelector(`.gear-icon[data-id="${currentLampId}"]`)?.closest('.control-card');
    if (card) card.querySelector('.dim-value').textContent = value;

    sendLampUpdate(currentLampId);  // Send update
  }
});

modalHueSlider.addEventListener('input', () => {
  const value = parseInt(modalHueSlider.value);
  modalHueValue.textContent = value;

  if (currentLampId) {
    lampStates[currentLampId].hue = value;

    const card = document.querySelector(`.gear-icon[data-id="${currentLampId}"]`)?.closest('.control-card');
    if (card) {
      card.querySelector('.hue-value').textContent = value;
    }

    sendLampUpdate(currentLampId);
  }
});
modalSaturationSlider.addEventListener('input', () => {
  const value = parseInt(modalSaturationSlider.value);
  modalSaturationValue.textContent = value + "%";

  if (currentLampId) {
    lampStates[currentLampId].saturation = value;

    const card = document.querySelector(`.gear-icon[data-id="${currentLampId}"]`)?.closest('.control-card');
    if (card) {
      const satSpan = card.querySelector('.saturation-value');
      if (satSpan) satSpan.textContent = value + "%";
    }

    sendLampUpdate(currentLampId);
  }
});


const canvas = document.getElementById('drawColorMap');
const ctx = canvas.getContext('2d');
const picker = document.getElementById('colormap-picker');

let isDragging = false;

// ====== 🎨 Draw Hue-Saturation Map ======
function drawColorMap() {
  const width = canvas.width;
  const height = canvas.height;

  const hueGradient = ctx.createLinearGradient(0, 0, width, 0);
  for (let i = 0; i <= 360; i += 60) {
    hueGradient.addColorStop(i / 360, `hsl(${i}, 100%, 50%)`);
  }

  ctx.fillStyle = hueGradient;
  ctx.fillRect(0, 0, width, height);

  const satGradient = ctx.createLinearGradient(0, 0, 0, height);
  satGradient.addColorStop(0, "rgba(255,255,255,0)");
  satGradient.addColorStop(1, "rgba(255, 252, 252, 1)");

  ctx.fillStyle = satGradient;
  ctx.fillRect(0, 0, width, height);
}

drawColorMap();

// ====== 🎯 Move Picker Knob ======
function movePicker(x, y) {
  // Clamp picker position so it stays inside the canvas
  const pickerRadius = 7; // adjust if your picker is larger/smaller
  const minX = pickerRadius;
  const minY = pickerRadius;
  const maxX = canvas.width - pickerRadius;
  const maxY = canvas.height - pickerRadius;

  const clampedX = Math.max(minX, Math.min(maxX, x));
  const clampedY = Math.max(minY, Math.min(maxY, y));

  picker.style.left = `${clampedX - pickerRadius}px`;
  picker.style.top = `${clampedY - pickerRadius}px`;
  picker.style.display = "block";
}

function updateColorPreview(hue, saturation) {
  // Use HSL for preview color
  const preview = document.getElementById('color-preview');
  preview.style.background = `hsl(${hue}, ${saturation}%, 50%)`;
}

// ====== 📈 Update Sliders from Canvas Pick ======
function pickColorFromCanvas(x, y) {
  const hue = Math.round((x / canvas.width) * 360);
  const saturation = Math.round((1 - y / canvas.height) * 100);

  modalHueSlider.value = hue;
  modalSaturationSlider.value = saturation;

  modalHueValue.textContent = hue;
  modalSaturationValue.textContent = `${saturation}%`;
  
  updateColorPreview(hue, saturation); 

  if (currentLampId) {
    lampStates[currentLampId].hue = hue;
    lampStates[currentLampId].saturation = saturation;

    const card = document.querySelector(`.gear-icon[data-id="${currentLampId}"]`)?.closest('.control-card');
    if (card) {
      card.querySelector('.hue-value').textContent = hue;
      card.querySelector('.saturation-value').textContent = `${saturation}%`;
    }

    sendLampUpdate(currentLampId);
  }
}

// ====== 🎮 Canvas Events ======
canvas.addEventListener('mousedown', (e) => {
  isDragging = true;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  movePicker(x, y);
  pickColorFromCanvas(x, y);
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  movePicker(x, y);
  pickColorFromCanvas(x, y);
});

document.addEventListener('mouseup', () => {
  isDragging = false;
});

// ====== 🔁 Update Picker Position When Sliders Change ======
modalHueSlider.addEventListener('input', updateColorMapPickerFromSliders);
modalSaturationSlider.addEventListener('input', updateColorMapPickerFromSliders);

function updateColorMapPickerFromSliders() {
  const hue = parseInt(modalHueSlider.value);
  const saturation = parseInt(modalSaturationSlider.value);

  const x = (hue / 360) * canvas.width;
  const y = (1 - saturation / 100) * canvas.height;

  movePicker(x, y);
   updateColorPreview(hue, saturation); 
}

// ====== 🧼 Reset picker position on modal open ======
document.querySelectorAll('.gear-icon').forEach(icon => {
  icon.addEventListener('click', () => {
    const hue = lampStates[currentLampId]?.hue || 0;
    const saturation = lampStates[currentLampId]?.saturation || 0;

    const x = (hue / 360) * canvas.width;
    const y = (1 - saturation / 100) * canvas.height;
    movePicker(x, y);
  });
});




// Initialize all control card displays with correct temp, dim, hue, and saturation values on page load
window.addEventListener('DOMContentLoaded', () => {
  Object.entries(lampStates).forEach(([id, state]) => {
    const card = document.querySelector(`.gear-icon[data-id="${id}"]`)?.closest('.control-card');
    if (card) {
      const tempSpan = card.querySelector('.temp-value');
      const dimSpan = card.querySelector('.dim-value');
      if (tempSpan) tempSpan.textContent = state.temp;
      if (dimSpan) dimSpan.textContent = state.dim;
      // Optionally add hue/saturation display if present in card
      const hueSpan = card.querySelector('.hue-value');
      const saturationSpan = card.querySelector('.saturation-value');
      if (hueSpan) hueSpan.textContent = state.hue;
      if (saturationSpan) saturationSpan.textContent = state.saturation + "%";
      
    }
  });
});



// air quality
let airData = {
  CO2: 800,
  PM25: 35,
  PM10: 60
};

const CO2_BUFFER = [];
const PM25_BUFFER = [];
const PM10_BUFFER = [];
const BUFFER_SIZE = 5 * 60 / 10; // 5 minutes if updated every 10s (30 entries)


let timeLabels = [];
let co2History = [];
let pm25History = [];
let pm10History = [];
const MAX_POINTS = 20;

// CO2 Realtime Bar Chart
const co2RealtimeCtx = document.getElementById('co2Realtime').getContext('2d');
const co2RealtimeChart = new Chart(document.getElementById('co2Realtime'), {
  type: 'bar',
  data: {
    labels: ['CO₂'],
    datasets: [{
      label: 'CO₂: (ppm)',
      data: [airData.CO2],
      backgroundColor: '#FF6384'
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 10
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 12 // or 10 for small charts
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: 12
          }
        }
      }
    }
  }

});


// PM2.5 & PM10 Realtime Bar Chart
const pmRealtimeCtx = document.getElementById('pmRealtime').getContext('2d');
const pmRealtimeChart = new Chart(pmRealtimeCtx, {
  type: 'bar',
  data: {
    labels: ['PM2.5', 'PM10'],
    datasets: [{
      label: 'µg/m³',
      data: [airData.PM25, airData.PM10],
      backgroundColor: ['#36a2eb', '#ffce56'],
      borderRadius: 8
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false // ✅ Hides the colored legend box
      },
      tooltip: {
        enabled: true  // ✅ Set to false if you also want to hide tooltips
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});


// CO2 History Line Chart
const co2HistoryCtx = document.getElementById('co2Chart').getContext('2d');
const co2Chart = new Chart(co2HistoryCtx, {
  type: 'line',
  data: {
    labels: timeLabels,
    datasets: [{
      label: 'CO₂ (ppm)',
      data: co2History,
      borderColor: '#ff6384',
      fill: false,
      tension: 0.3
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'nearest',   // can also use 'index' for aligned values
      intersect: false   // allow hovering even if not directly on line
    },
    plugins: {
      tooltip: {
        enabled: true,
        mode: 'index',   // show all datasets at that index
        intersect: false,
      }
    },
    scales: {
      x: {
        ticks: { maxTicksLimit: 6 },
        title: { display: true, text: 'Time' },
  
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'ppm' },

      }
    }
  }

});

// PM History Line Chart
const pmHistoryCtx = document.getElementById('pmChart').getContext('2d');
const pmChart = new Chart(pmHistoryCtx, {
  type: 'line',
  data: {
    labels: timeLabels,
    datasets: [
      {
        label: 'PM2.5 (µg/m³)',
        data: pm25History,
        borderColor: '#36a2eb',
        fill: false,
        tension: 0.3
      },
      {
        label: 'PM10 (µg/m³)',
        data: pm10History,
        borderColor: '#ffce56',
        fill: false,
        tension: 0.3
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: {
        ticks: { maxTicksLimit: 6 },
        title: { display: true, text: 'Time' },
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'µg/m³' },

      }
    }
  }

});


function getAirQualityLevel(type, value) {
  if (type === 'CO2') {
    if (value <= 1000) return { text: 'Good', class: 'good' };
    if (value <= 2000) return { text: 'Moderate', class: 'moderate' };
    return { text: 'Unhealthy', class: 'unhealthy' };
  }

  if (type === 'PM') {
    if (value <= 35) return { text: 'Good', class: 'good' };
    if (value <= 55) return { text: 'Moderate', class: 'moderate' };
    if (value <= 150) return { text: 'Unhealthy', class: 'unhealthy' };
    return { text: 'Very Unhealthy', class: 'very-unhealthy' };
  }
}


// Simulate data update
setInterval(() => {
  // Simulate real-time updates
  airData.CO2 = Math.floor(400 + Math.random() * 1000);
  airData.PM25 = Math.floor(Math.random() * 80);
  airData.PM10 = Math.floor(Math.random() * 150);

  // --- Update Real-Time Charts ---
  co2RealtimeChart.data.datasets[0].data = [airData.CO2];
  co2RealtimeChart.update();

  pmRealtimeChart.data.datasets[0].data = [airData.PM25, airData.PM10];
  pmRealtimeChart.update();

  // --- Add to Buffers (sliding window) ---
  // Update sliding buffers
  CO2_BUFFER.push(airData.CO2);
  PM25_BUFFER.push(airData.PM25);
  PM10_BUFFER.push(airData.PM10);
  if (CO2_BUFFER.length > BUFFER_SIZE) {
    CO2_BUFFER.shift();
    PM25_BUFFER.shift();
    PM10_BUFFER.shift();
}

// Compute 5-min averages
const avgCO2 = Math.round(CO2_BUFFER.reduce((a, b) => a + b, 0) / CO2_BUFFER.length);
const avgPM25 = Math.round(PM25_BUFFER.reduce((a, b) => a + b, 0) / PM25_BUFFER.length);
const avgPM10 = Math.round(PM10_BUFFER.reduce((a, b) => a + b, 0) / PM10_BUFFER.length);

// Determine worst PM status
const worstPM = Math.max(avgPM25, avgPM10);

// Determine CO2 status
const co2Level = getAirQualityLevel('CO2', avgCO2);
const co2StatusEl = document.getElementById('co2Status');
co2StatusEl.textContent = `Status: ${co2Level.text}`;
co2StatusEl.className = `status-inline ${co2Level.class}`;

// Determine PM status
const pmLevel = getAirQualityLevel('PM', worstPM);
const pmStatusEl = document.getElementById('pmStatus');
pmStatusEl.textContent = `Status: ${pmLevel.text}`;
pmStatusEl.className = `status-inline ${pmLevel.class}`;


  // --- Update History Charts ---
  const now = new Date();
  const timeLabel = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

  timeLabels.push(timeLabel);
  co2History.push(airData.CO2);
  pm25History.push(airData.PM25);
  pm10History.push(airData.PM10);

  if (timeLabels.length > MAX_POINTS) {
    timeLabels.shift();
    co2History.shift();
    pm25History.shift();
    pm10History.shift();
  }

  co2Chart.update();
  pmChart.update();
}, 5000); // Assuming updates every 10 seconds



