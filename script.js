'use strict';

class WorkOut {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  clicks = 0;

  constructor(coords, distance, duration) {
    this.coords = coords; //aray lanlat
    this.distance = distance;
    this.duration = duration;
  }
  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()} `;
  }
  _click() {
    this.clicks++;
  }
}
class Running extends WorkOut {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }
  calcPace() {
    //pace=min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends WorkOut {
  type = 'cycling';
  constructor(coords, distance, duration, elavationGain) {
    super(coords, distance, duration);
    this.elavationGain = elavationGain;
    this.calcSpeed();
    this._setDescription();
  }
  calcSpeed() {
    //speed=km/min
    this.speed = this.distance / this.duration;
    return this.speed;
  }
}

/*const run1 = new Running([23, 45], 34, 56, 23);
console.log(run1);*/

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
  #mapEvent;
  #map;
  #workouts = [];
  #mapZoomLevel = 13;
  constructor() {
    this._getPosition();
    this._getLocalStorage();
    inputType.addEventListener('change', this._toggleElavationField.bind(this));
    form.addEventListener('submit', this._netWorkOut.bind(this));
    containerWorkouts.addEventListener('click', this._movePopup.bind(this));
  }
  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMapPosition.bind(this),

        /* console.log(mapEvent);
        const { lat, lng } = mapEvent.latlng;
        L.marker([lat, lng])
          .addTo(map)
          .bindPopup(
            L.popup({
              maxWidth: 250,
              minWidth: 100,
              autoClose: false,
              closeOnClick: false,
              className: 'running-popup',
            })
          )
          .setPopupContent('WorkOut')
          .openPopup();*/
        function () {
          alert('could not able to loas your location');
        }
      );
  }
  _loadMapPosition(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(`www.google.com/maps/@,${latitude}${longitude}`);

    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.fr/hot/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));

    this.#workouts.forEach(work => {
      this._renderOnMaps(work);
    });
  }
  _showForm(mapE) {
    this.#mapEvent = mapE;
    // console.log(#mapEvent);
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _hideForm() {
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }
  _toggleElavationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }
  _netWorkOut(e) {
    const isValidData = (...input) => input.every(inp => Number.isFinite(inp));
    const allPositive = (...input) => input.every(inp => inp > 0);
    e.preventDefault();
    /*inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';*/
    //get the input from the forms
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;

    let workout;
    const { lat, lng } = this.#mapEvent.latlng;

    //object for running
    //data validation
    if (type === 'running') {
      const cadence = +inputCadence.value;
      if (
        !isValidData(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        alert('The input data should be a positive number');

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    //object for cycling
    //data validation
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      if (
        !isValidData(distance, duration) ||
        !allPositive(distance, duration)
      ) {
        alert('The input data should be a positive number');
      }
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }
    //adding objects to the workouts array
    this.#workouts.push(workout);
    console.log(workout);

    //rendering workout on maps
    this._renderOnMaps(workout);
    //render workout on list
    this._renderWorkouts(workout);

    this._hideForm();

    this._setLocalStorage();

    //rendering workouts on forms
  }
  _renderOnMaps(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♂️'} ${workout.description}`
      )
      .openPopup();
  }

  _renderWorkouts(workout) {
    let html = `<li class="workout workout--running" data-id=${workout.id}>
    <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">${
        workout.type === 'running' ? '🏃‍♂️' : '🚴‍♂️'
      }</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>
    `;
    if (workout.type === 'running')
      html += `
      <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.pace.toFixed(1)}</span>
      <span class="workout__unit">min/km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value">${workout.cadence}</span>
      <span class="workout__unit">spm</span>
    </div>
  </li>
      `;
    if (workout.type === 'cycling')
      html += `
    <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elavationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>
      `;

    form.insertAdjacentHTML('afterend', html);
  }
  _movePopup(e) {
    const workoutEL = e.target.closest('.workout');
    if (!workoutEL) return;

    const workout = this.#workouts.find(
      work => work.id === workoutEL.dataset.id
    );

    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
    // workout._click();
  }
  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));

    if (!data) return;

    this.#workouts = data;
    this.#workouts.forEach(work => {
      this._renderWorkouts(work);
    });
  }
  remove() {
    localStorage.removeItem('workouts');
  }
}
const app = new App();
//app.remove();
