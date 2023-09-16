const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');


// utility functions
function filterObject (object, ...allowedFields) {
    const newObject = {};
    Object.keys(object).forEach(element => {
        if (allowedFields.includes(element)) {
            newObject[element] = object[element];
        }
    });

    return newObject;
}


// ---- USERS CONTROLLERS ----

// when user update his/her data i.e. email etc.
const updateMe = catchAsync(async function (request, response, next) {
    // 1- create error if user POSTed password data (if he/she tries to update password)
    if (request.body.password || request.body.passwordConfirm) {
        return next(new AppError('This route is not for password update. Please use /updatePassword', 400));
    }

    // 2- filter user object fields which shouldn't be saved, in other words;
    // specify only the fields which are supposed to be updated.
    const filteredBody = filterObject(request.body, 'name', 'email');

    // 3- update user document
    const updatedUser = await User.findByIdAndUpdate(request.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    response.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});


const deleteMe = catchAsync(async function (request, response, next) {
    await User.findByIdAndUpdate(request.user.id, { active: false });

    response.status(204).json({
        status: 'success',
        data: null
    });
});


const getAllUsers = catchAsync(async (request, response) => {

    const users = await User.find().where({ active: { $eq: true } });

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
    updateMe: updateMe,
    deleteMe: deleteMe,
    getAllUsers: getAllUsers,
    getUser: getUser,
    createUser: createUser,
    updateUser: updateUser,
    deleteUser: deleteUser
};