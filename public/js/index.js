import displayMap from './leafletMap.js';
import { login, logout } from './login.js';
import { updateUserData } from './updateData.js';
import { bookTour } from './stripe.js';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutButton = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

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
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    // commented out as we are not sending data as JS object, instead now it is FormData() object
    // updateUserData({ name: name, email: email, }, 'data');
    updateUserData(form, 'data');
});

if (userPasswordForm) userPasswordForm.addEventListener('submit', async event => {
    event.preventDefault();

    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateUserData({ passwordConfirm, password, passwordCurrent }, 'password');

    document.querySelector('.btn--save-password').textContent = 'Save Password';

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
});

if (bookBtn) bookBtn.addEventListener('click', event => {
    event.target.textContent = 'Processing...';
    const { tourId } = event.target.dataset;
    bookTour(tourId);
});