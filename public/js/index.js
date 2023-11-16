import displayMap from './leafletMap.js';
import { login, logout } from './login.js';
import { updateUserData } from './updateSettings.js';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutButton = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');

// DELEGATION
if (mapBox) {
    // dataset variable is defined in template on the element of ID = #map
    // so the element will include all data in it's dataset.location property
    const locations = JSON.parse(document.getElementById('map').dataset.locations);
    displayMap(locations);
}

if (loginForm) {
    document.querySelector('.form').addEventListener('submit', event => {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
}

if (logoutButton) logoutButton.addEventListener('click', logout);

if (userDataForm) userDataForm.addEventListener('submit', event => {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    updateUserData(name, email);
});
