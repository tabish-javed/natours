/* eslint-disable no-unused-vars */
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');


/**
 * This function generate and returns "json web token".
 * @param {_id} id
 * @returns JSON Web Token
 */
function signToken (id) {
    return jwt.sign({ id: id },
        process.env.JWT_SECRET, { expiresIn: process.env.JWD_EXPIRY });
}


const signUp = catchAsync(async function (request, response, next) {
    const newUser = await User.create({
        name: request.body.name,
        email: request.body.email,
        password: request.body.password,
        passwordConfirm: request.body.passwordConfirm
    });

    const token = signToken(newUser._id);

    // do not send password to user
    newUser.password = undefined;
    response.status(201).json({
        status: 'success',
        token: token,
        data: {
            user: newUser
        }
    });
});


const logIn = catchAsync(async function (request, response, next) {
    const { email, password } = request.body;

    // 1 check if email and password exist
    if (!email || !password) return next(new AppError('Please provide email and password', 400));

    // 2 check if user exists && password is correct
    const user = await User.findOne({ email: email }).select('+password');

    // using bcrypt in userModel define a method to user object. Then use that method in here
    if (!user || !(await user.isPasswordCorrect(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }
    // 3 if everything is ok, send token to client
    const token = signToken(user._id);

    response.status(200).json({
        status: 'success',
        token: token
    });
});


module.exports = {
    signUp: signUp,
    logIn: logIn
};