/* eslint-disable no-unused-vars */
const User = require('./../models/userModel');
const catchAsync = require('../utils/catchAsync');


const signUp = catchAsync(async function (request, response, next) {
    const newUser = await User.create(request.body);

    response.status(201).json({
        status: 'success',
        data: {
            user: newUser
        }
    });
});


module.exports = {
    signUp: signUp
};