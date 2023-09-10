const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

// USERS CONTROLLERS ----
const getAllUsers = catchAsync(async (request, response, next) => {

    const users = await User.find();

    // send response
    response.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users: users
        }
    });
});


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

module.exports = {
    getAllUsers: getAllUsers,
    getUser: getUser,
    createUser: createUser,
    updateUser: updateUser,
    deleteUser: deleteUser
};