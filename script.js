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
  document.getElementById("tempRange").addEventListener("input", function () {
    document.getElementById("tempValue").textContent = this.value;
  });

  // Update humidity display
  document.getElementById("humidRange").addEventListener("input", function () {
    document.getElementById("humidValue").textContent = this.value;
  });

  // Fan speed buttons
  document.querySelectorAll(".fan-btn").forEach(button => {
    button.addEventListener("click", function () {
      document.querySelectorAll(".fan-btn").forEach(btn => btn.classList.remove("active"));
      this.classList.add("active");
      console.log("Fan Speed:", this.dataset.speed);
    });
  });

  // Swing toggle
  document.getElementById("swingToggle").addEventListener("change", function () {
    const swingText = this.checked ? "On" : "Off";
    document.getElementById("swingState").textContent = swingText;
    console.log("Swing is", swingText);
  });

    const acPanel = document.querySelector(".ac-panel");
  const acPowerToggle = document.getElementById("acPowerToggle");
  const powerStateText = document.getElementById("powerState");

  acPowerToggle.addEventListener("change", function () {
    const isOn = this.checked;
    powerStateText.textContent = isOn ? "On" : "Off";
    acPanel.querySelectorAll(".knob input, .fan-btn, #swingToggle").forEach(el => {
      el.disabled = !isOn;
    });
    document.querySelectorAll(".fan-btn").forEach(btn => {
      btn.style.opacity = isOn ? 1 : 0.4;
    });
  });

function updateRing(inputId, progressClass, textId, unit, min, max) {
  const input = document.getElementById(inputId);
  const circle = document.querySelector(`.${progressClass}`);
  const text = document.getElementById(textId);

  const update = () => {
    const val = +input.value;
    const percent = (val - min) / (max - min);
    const dashoffset = 314 - (314 * percent);
    circle.style.strokeDashoffset = dashoffset;
    text.textContent = `${val}${unit}`;
  };

  input.addEventListener("input", update);
  update(); // Initial
}

updateRing("tempRange", "progress.temp", "tempValueText", "°C", 16, 30);
updateRing("humidRange", "progress.humid", "humidValueText", "%", 30, 70);


  // Open modal and rotate icon
  document.querySelectorAll('.gear-icon').forEach(icon => {
    icon.addEventListener('click', function () {
      const modalId = this.getAttribute('data-target');
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.style.display = 'block';
        this.classList.add('rotated'); // rotate the icon
      }
    });
  });

  // Close modal and un-rotate icon
  document.querySelectorAll('.close-button').forEach(button => {
    button.addEventListener('click', function () {
      const modalId = this.getAttribute('data-target');
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.style.display = 'none';
        // find related icon
        const icon = document.querySelector(`.gear-icon[data-target="${modalId}"]`);
        if (icon) icon.classList.remove('rotated');
      }
    });
  });