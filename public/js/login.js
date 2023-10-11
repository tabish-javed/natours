/* eslint-disable no-console */
import helper from './helper.js';


async function login (email, password) {
    try {
        const response = await helper.AJAX('http://localhost:3000/api/v1/users/login', {
            email: email,
            password: password
        });

        if (response.status === 'success') {
            alert('Logged in successfully!');
            setTimeout(() => {
                location.assign('/');
            }, 1_000);
        } else return;

    } catch (error) {
        alert(error);
    }
}

document.querySelector('.form').addEventListener('submit', event => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
});