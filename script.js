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
  'garage': 'garage-room'
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
const lampStates = {
  // living
  'celling-lamp-lv': {status: "on", temp: 3000, dim: 50,tempMin: 2700, tempMax: 3000, tempStep: 1 },
  'floor-lamp-lv': {status: "off", temp: 2700, dim: 60,tempMin: 2700, tempMax: 3000, tempStep: 1 },
  'Table-Lamp-lv': {status: "off", temp: 2700, dim: 70,tempMin: 2700, tempMax: 3000, tempStep: 1 },
  'Accent-Light-lv': {status: "off", temp: 2700, dim: 70, tempMin: 2700, tempMax: 3000, tempStep: 1 },

  // dinning
  'chandelier-Dining': {status: "off", temp: 2700, dim: 70, tempMin: 2700, tempMax: 3000, tempStep: 1 },
  'Wall-Sconce-Dining': {status: "off", temp: 2700, dim: 70, tempMin: 2700, tempMax: 3000, tempStep: 1 },

  //  kitchen
   'Recessed-Light-kitchen': {status: "off", temp: 3000, dim: 70, tempMin: 3000, tempMax: 4000, tempStep: 1 },
  'Cabinet-Light-kitchen': {status: "off", temp: 3000, dim: 70, tempMin: 3000, tempMax: 4000, tempStep: 1 },
  'Pendant-Light-kitchen': {status: "off", temp: 3000, dim: 70, tempMin: 3000, tempMax: 4000, tempStep: 1 },
  'Track-Light-kitchen': {status: "off", temp: 3000, dim: 70, tempMin: 3000, tempMax: 4000, tempStep: 1 },

  // Bedroom 
  'Ceiling-Light-Bed': {status: "off", temp: 3000, dim: 70, tempMin: 3000, tempMax: 4000, tempStep: 1 },
  'Bedside-Lamp-Bed': {status: "off", temp: 3000, dim: 70, tempMin: 3000, tempMax: 4000, tempStep: 1 },
  'Smart-Light-Bed': {status: "off", temp: 3000, dim: 70, tempMin: 3000, tempMax: 4000, tempStep: 1 },
  
  //Garageep
  'LED-Ceiling-garage': {status: "off", temp: 5000, dim: 70, tempMin: 4000, tempMax: 6500, tempStep: 1 },
  'otion-Sensor-garage': {status: "off", temp: 5000, dim: 70, tempMin: 4000, tempMax: 6500, tempStep: 1 },
  'Task-Lighting-garage': {status: "off", temp: 5000, dim: 70, tempMin: 4000, tempMax: 6500, tempStep: 1 },

};

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





// sending

const IP = 'http://192.168.1.106:8081'; // Your ESP32 IP

// Debounce storage per lamp
const debounceTimers = {};

function sendLampUpdate(lampId, useDebounce = true) {
  const lamp = lampStates[lampId];
  if (!lamp) return;

  const payload = [{
    id: lampId,
    name: lampId.replace(/-/g, ' '),
    status: lamp.status,
    temp: lamp.temp,
    dim: lamp.dim
  }];

  const sendRequest = () => {
    fetch(`${IP}/lamp-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.text())
      .then(msg => console.log("ESP32 Response:", msg))
      .catch(err => console.error("ESP32 Error:", err));
  };

  if (useDebounce) {
    clearTimeout(debounceTimers[lampId]);
    debounceTimers[lampId] = setTimeout(sendRequest, 80); // 🔁 real-time feel, safe delay
  } else {
    sendRequest();
  }
}


// Called when switch is toggled
function sendSwitchStatus(checkbox) {
  const lampId = checkbox.getAttribute('data-id');
  const status = checkbox.checked ? 'on' : 'off';

  if (lampStates[lampId]) {
    lampStates[lampId].status = status;
    sendLampUpdate(lampId, false); // send immediately on toggle
  } else {
    console.warn(`Lamp ID "${lampId}" not found in lampStates.`);
  }
}



// modal

const modal = document.getElementById("universal-modal");
const modalCloseBtn = document.getElementById("modal-close");
const modalTempSlider = document.getElementById("modal-temp-slider");
const modalDimSlider = document.getElementById("modal-dim-slider");
const modalTempValue = document.getElementById("modal-temp-value");
const modalDimValue = document.getElementById("modal-dim-value");
let currentLampId = null;
// Open modal on gear icon click
document.querySelectorAll('.gear-icon').forEach(icon => {
  icon.addEventListener('click', function () {
    currentLampId = this.getAttribute('data-id');
    const lamp = lampStates[currentLampId];
    if (!lamp) return;

    //  Set dynamic range for temp
    modalTempSlider.min = lamp.tempMin;
    modalTempSlider.max = lamp.tempMax;
    modalTempSlider.step = lamp.tempStep;

    // Load values
    modalTempSlider.value = lamp.temp;
    modalDimSlider.value = lamp.dim;
    modalTempValue.textContent = lamp.temp;
    modalDimValue.textContent = lamp.dim;

    // Show modal
    modal.style.display = 'block';
    requestAnimationFrame(() => modal.classList.add('show'));
  });
});
// Close modal
modalCloseBtn.addEventListener('click', () => {
  modal.classList.remove('show');
  setTimeout(() => modal.style.display = 'none', 500);
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

// Initialize all control card displays with correct temp and dim values on page load
window.addEventListener('DOMContentLoaded', () => {
  Object.entries(lampStates).forEach(([id, state]) => {
    const card = document.querySelector(`.gear-icon[data-id="${id}"]`)?.closest('.control-card');
    if (card) {
      const tempSpan = card.querySelector('.temp-value');
      const dimSpan = card.querySelector('.dim-value');
      if (tempSpan) tempSpan.textContent = state.temp;
      if (dimSpan) dimSpan.textContent = state.dim;
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
