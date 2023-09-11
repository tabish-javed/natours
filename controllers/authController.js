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
    // finally send response with token and user data
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


const protect = catchAsync(async function (request, response, next) {
    // 1 check if token exists in request
    let token;
    if (request.headers.authorization && request.headers.authorization.startsWith('Bearer')) {
        token = request.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access', 401));
    };

    // 2 verify token

    // 3 check if user still exists

    // 4 check if user changed password after token was issued


    next();
});


module.exports = {
    signUp: signUp,
    logIn: logIn,
    protect: protect
};