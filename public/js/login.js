/* eslint-disable no-console */
import helper from './helper.js';
import { showAlert } from './alerts.js';


async function login (email, password) {
    try {
        const response = await helper.AJAX('http://localhost:3000/api/v1/users/login', {
            email: email,
            password: password
        });

        if (response.status === 'success') {
            showAlert('success', 'Logged In successfully!');
            setTimeout(() => {
                location.assign('/');
            }, 1_000);
        } else return;

    } catch (error) {
        showAlert('error', error);
    }
}


async function logout () {
    try {
        const response = await helper.AJAX('http://localhost:3000/api/v1/users/logout');

        if (response.status === 'success') {
            showAlert('success', 'Logged Out successfully!');
            setTimeout(() => {
                location.assign('/');
            }, 1_000);
        }

    } catch (error) {
        showAlert('error', "Error logging out! please try again.");
    }
}


export { login, logout };