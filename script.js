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
  'celling-lamp-lv': { temp: 2700, dim: 50, tempMin: 2700, tempMax: 3000, tempStep: 1 },
  'floor-lamp-lv': { temp: 2700, dim: 60, tempMin: 2700, tempMax: 3000, tempStep: 1 },
  'Table-Lamp-lv': { temp: 2700, dim: 70, tempMin: 2700, tempMax: 3000, tempStep: 1 },
  'Accent-Light-lv': { temp: 2700, dim: 70, tempMin: 2700, tempMax: 3000, tempStep: 1 },

  // dinning
  'chandelier-Dining': { temp: 2700, dim: 70, tempMin: 2700, tempMax: 3000, tempStep: 1 },
  'Wall-Sconce-Dining': { temp: 2700, dim: 70, tempMin: 2700, tempMax: 3000, tempStep: 1 },

  //  kitchen
   'Recessed-Light-kitchen': { temp: 3000, dim: 70, tempMin: 3000, tempMax: 4000, tempStep: 1 },
  'Cabinet-Light-kitchen': { temp: 3000, dim: 70, tempMin: 3000, tempMax: 4000, tempStep: 1 },
  'Pendant-Light-kitchen': { temp: 3000, dim: 70, tempMin: 3000, tempMax: 4000, tempStep: 1 },
  'Track-Light-kitchen': { temp: 3000, dim: 70, tempMin: 3000, tempMax: 4000, tempStep: 1 },

  // Bedroom 
  'Ceiling-Light-Bed': { temp: 3000, dim: 70, tempMin: 3000, tempMax: 4000, tempStep: 1 },
  'Bedside-Lamp-Bed': { temp: 3000, dim: 70, tempMin: 3000, tempMax: 4000, tempStep: 1 },
  'Smart-Light-Bed': { temp: 3000, dim: 70, tempMin: 3000, tempMax: 4000, tempStep: 1 },
  
  //Garage
  'LED-Ceiling-garage': { temp: 5000, dim: 70, tempMin: 4000, tempMax: 6500, tempStep: 1 },
  'otion-Sensor-garage': { temp: 5000, dim: 70, tempMin: 4000, tempMax: 6500, tempStep: 1 },
  'Task-Lighting-garage': { temp: 5000, dim: 70, tempMin: 4000, tempMax: 6500, tempStep: 1 },

};

const { temp, dim } = lampStates['Pendant-Light-kitchen'];
console.log(`Pendant Light: ${temp}K, ${dim}%`);

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

    // 🧠 Set dynamic range for temp
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

// Live updates while sliding
modalTempSlider.addEventListener('input', () => {
  const value = parseInt(modalTempSlider.value);
  modalTempValue.textContent = value;

  if (currentLampId) {
    lampStates[currentLampId].temp = value;

    const card = document.querySelector(`.gear-icon[data-id="${currentLampId}"]`).closest('.control-card');
    if (card) {
      card.querySelector('.temp-value').textContent = value;
    }
  }
});

modalDimSlider.addEventListener('input', () => {
  const value = parseInt(modalDimSlider.value);
  modalDimValue.textContent = value;

  if (currentLampId) {
    lampStates[currentLampId].dim = value;

    const card = document.querySelector(`.gear-icon[data-id="${currentLampId}"]`).closest('.control-card');
    if (card) {
      card.querySelector('.dim-value').textContent = value;
    }
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

    current += difference * 0.07;
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

