/* Add event listeners to all switch inputs to log device status changes */
document.querySelectorAll('.switch input').forEach(input => {
  input.addEventListener('change', function() {
    const card = this.closest('.control-card');
    const device = card.querySelector('h3').textContent;
    console.log(`${device} is now ${this.checked ? 'ON' : 'OFF'}`);
  });
});

/* Add event listeners to AC buttons to control temperature */
document.querySelectorAll('.ac-buttons button').forEach(button => {
  button.addEventListener('click', function() {
    const tempControl = document.querySelector('.temp-control span');
    let temp = parseInt(tempControl.textContent);
    if (this.textContent === 'AC ON') {
      temp = 25;
    } else if (this.textContent === 'AC OFF') {
      temp = 21;
    }
    tempControl.textContent = `${temp}°C`;
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

