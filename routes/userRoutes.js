const express = require('express');

// USERS CONTROLLERS ----
function getAllUsers (request, response) {
    response.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!'
    });
}

function getUser (request, response) {
    response.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!'
    });
}

function createUser (request, response) {
    response.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!'
    });
}

function updateUser (request, response) {
    response.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!'
    });
}

function deleteUser (request, response) {
    response.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!'
    });
}


const router = express.Router();

router.route('/')
    .get(getAllUsers)
    .post(createUser);


router.route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);

module.exports = router;