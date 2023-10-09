/* eslint-disable no-console */
const REQUEST_TIMEOUT = 5;

function timeout (seconds) {
    return new Promise((_, reject) => {
        setTimeout(() => {
            reject(Error(`Request timed out. Please try again later...`));
        }, seconds * 1_000);
    });
}


async function AJAX (url, uploadData = undefined) {
    try {
        const requestPromise = uploadData
            ? fetch(url, {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(uploadData)
            })
            : fetch(url);

        const response = await Promise.race([requestPromise, timeout(REQUEST_TIMEOUT)]);
        const data = await response.json();

        if (!response.ok) throw Error(data.message);
        return data;
    } catch (error) {
        throw error.message;
    }
}


async function login (email, password) {
    try {
        const response = await AJAX('http://localhost:3000/api/v1/users/login', {
            email: email,
            password: password
        });

        if (response.status !== 'success') return;

        // setTimeout(() => {
        //     window.location.replace('/');
        // }, 1_000);

    } catch (error) {
        console.error(error.message);
    }
}

document.querySelector('.form').addEventListener('submit', event => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
});