/* Add event listeners to all switch inputs to log device status changes */
document.querySelectorAll('.switch input').forEach(input => {
  input.addEventListener('change', function() {
    const card = this.closest('.control-card');
    const device = card.querySelector('h3').textContent;
    console.log(`${device} is now ${this.checked ? 'ON' : 'OFF'}`);
  });
});


/* Mapping between button label and corresponding class */
const roomClassMap = {
  'living': 'living-room',
  'dining': 'dining-room',
  'kitchen': 'kitchen-room',
  'bedroom': 'bedroom-room',
  'garage': 'garage-room'
};

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



/* Temperature slider interaction for living room lights */
document.querySelectorAll('.control-card.living-room .temp-slider').forEach(slider => {
  slider.addEventListener('input', function () {
    const value = this.value;
    const card = this.closest('.control-card');
    const tempDisplay = card.querySelector('.temp-value');
    tempDisplay.textContent = value;
    console.log(`${card.querySelector('h3').textContent} temp set to ${value}K`);
  });
});



// Open modal on gear icon click
document.querySelectorAll('.gear-icon').forEach(icon => {
  icon.addEventListener('click', function () {
    const targetId = this.getAttribute('data-target');
    document.getElementById(targetId).style.display = 'block';
  });
});

// Close modal on close button click
document.querySelectorAll('.close-button').forEach(button => {
  button.addEventListener('click', function () {
    const targetId = this.getAttribute('data-target');
    document.getElementById(targetId).style.display = 'none';
  });
});

// Update temperature and dim from sliders
document.querySelectorAll('.control-card').forEach(card => {
  const tempValue = card.querySelector('.temp-value');
  const dimValue = card.querySelector('.dim-value');

  const modal = card.querySelector('.modal');
  if (!modal) return; // skip cards without modals

  const modalTempSlider = modal.querySelector('.modal-temp-slider');
  const modalDimSlider = modal.querySelector('.modal-dim-slider');
  const modalTempValue = modal.querySelector('.modal-temp-value');
  const modalDimValue = modal.querySelector('.modal-dim-value');

  modalTempSlider.addEventListener('input', () => {
    modalTempValue.textContent = modalTempSlider.value;
    tempValue.textContent = modalTempSlider.value;
  });

  modalDimSlider.addEventListener('input', () => {
    modalDimValue.textContent = modalDimSlider.value;
    dimValue.textContent = modalDimSlider.value;
  });
});



// Open modal on gear icon click
document.querySelectorAll('.gear-icon').forEach(icon => {
  icon.addEventListener('click', function () {
    const targetId = this.getAttribute('data-target');
    const modal = document.getElementById(targetId);

    modal.style.display = 'block'; // make sure it's visible
    requestAnimationFrame(() => {
      modal.classList.add('show'); // trigger animation
    });
  });
});

// Close modal on close button click
document.querySelectorAll('.close-button').forEach(button => {
  button.addEventListener('click', function () {
    const targetId = this.getAttribute('data-target');
    const modal = document.getElementById(targetId);

    modal.classList.remove('show'); // animate out
    setTimeout(() => {
      modal.style.display = 'none'; // hide after animation
    }, 500); // matches CSS transition duration
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
