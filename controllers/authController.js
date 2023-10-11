/* eslint-disable no-unused-vars */
import crypto from 'crypto';
import util from 'util';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import sendEmail from '../utils/email.js';

/**
 * This function generate and returns "json web token".
 * @param {_id} id
 * @returns JSON Web Token
 */
async function signToken (id) {
    return await util.promisify(jwt.sign)({ id: id },
        process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
}


async function decodeToken (token) {
    return await util.promisify(jwt.verify)(token, process.env.JWT_SECRET);
}


async function createSendToken (user, statusCode, response) {
    const token = await signToken(user._id);
    // set cookie options to be used to create cookie
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1_000),
        httpOnly: true
    };

    // depending on the app environment set secure property on the cookie
    cookieOptions.secure = process.env.NODE_ENV === 'production' ? true : false;

    // add cookie in the response
    response.cookie('jwt', token, cookieOptions);

    // remove "password" and "active" field before sending in data in response
    user.password = undefined;
    user.active = undefined;

    // finally send response
    response.status(statusCode).json({
        status: 'success',
        token: token,
        data: {
            user: user
        }
    });
}


const signUp = catchAsync(async function (request, response, next) {
    const newUser = await User.create({
        name: request.body.name,
        email: request.body.email,
        password: request.body.password,
        passwordConfirm: request.body.passwordConfirm,
        passwordChangedAt: request.body.passwordChangedAt,
        role: request.body.role,
    });

    // do not send password to user
    newUser.password = undefined;

    // finally send response with token and user data
    await createSendToken(newUser, 201, response);

    // CODE BELOW IS REPLACED BY createSendToken()
    // const token = await signToken(newUser._id);
    // response.status(201).json({
    //     status: 'success',
    //     token: token,
    //     data: {
    //         user: newUser
    //     }
    // });
});


const logIn = catchAsync(async function (request, response, next) {
    const { email, password } = request.body;

    // 1 check if email and password exist
    if (!email || !password) return next(new AppError('Please provide email and password', 400));

    // 2 check if user exists && password is correct
    const user = await User.findOne({ email: email }).select('+password').select('+active');

    // using bcrypt in userModel define a method to user object. Then use that method in here
    if (!user || !(await user.isPasswordCorrect(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    // 3- set user's active field/property to true
    user.active = true;
    await user.save({ validateModifiedOnly: true });

    // 4- if everything is ok, send token to client
    await createSendToken(user, 200, response);
});


const protect = catchAsync(async function (request, response, next) {
    // 1 check if token exists in request
    let token;
    if (request.headers.authorization && request.headers.authorization.startsWith('Bearer')) {
        token = request.headers.authorization.split(' ')[1];
    } else if (request.cookies.jwt) {
        token = request.cookies.jwt;
    }

    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    };
    // 2 verify token
    const decoded = await decodeToken(token);
    // 3 check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('User belongs to the token no longer exist.', 401));
    }
    // 4 check if user changed password after token was issued
    if (currentUser.isPasswordChanged(decoded.iat)) {
        return next(new AppError('User recently changed password! Please login again.', 401));
    }

    // finally grant access to protect route
    // AND send user object along with request to next route
    // which is in this case is "restrict" route
    request.user = currentUser;
    next();
});


// only for rendered pages without creating errors
const isLoggedIn = catchAsync(async function (request, response, next) {
    // 1 check if token exists in request
    if (request.cookies.jwt) {
        // 2 verify token
        const decoded = await decodeToken(request.cookies.jwt);

        // 3 check if user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return next();
        }

        // 4 check if user changed password after token was issued
        if (currentUser.isPasswordChanged(decoded.iat)) {
            return next();
        }

        // on all check above cleared, means user is logged in
        response.locals.user = currentUser;
        return next();
    }
    next();
});


const restrict = function (...roles) {
    return function (request, response, next) {
        // roles ['admin', 'lead-guide'] - role is now just "user"
        // receives user's role property from protect route as it was executed just before
        if (!roles.includes(request.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};


const forgotPassword = catchAsync(async function (request, response, next) {
    // 1- get user based on POSTed email
    const user = await User.findOne({ email: request.body.email });
    if (!user) return next(new AppError('There is no user with this email address.', 404));

    // 2- generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateModifiedOnly: true });


    // 3- send email
    const resetURL = `${request.protocol}://${request.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to:\n${resetURL} \n\nIf you didn't request this password reset, please ignore this email!`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid only for 10 minutes',
            message: message,
        });

        response.status(200).json({
            status: 'success',
            message: 'Token sent to email'
        });
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateModifiedOnly: true });

        return next(new AppError('There was an error sending the email. Try again later!', 500));
    }
});


const resetPassword = catchAsync(async function (request, response, next) {
    // 1- get user based on the token
    const hashedToken = crypto.createHash('sha256')
        .update(request.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    // 2- check token is expired? and there is user, then set the new password
    if (!user) {
        return next(new AppError('Invalid token or has expired', 400));
    }

    user.password = request.body.password;
    user.passwordConfirm = request.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3- update changedPasswordAt property for the user
    // *step 3 was taken care by a pre hook on password save field in userModel

    // 4- log the user in and send JWT
    await createSendToken(user, 200, response);
});


const updatePassword = catchAsync(async function (request, response, next) {
    // 1- get user from collection
    const user = await User.findById(request.user.id).select('+password');

    // 2- check if POSTed password is correct
    if (!(await user.isPasswordCorrect(request.body.passwordCurrent, user.password))) {
        return next(new AppError('The supplied password is incorrect', 401));
    }

    // 3- if so, update password
    user.password = request.body.password;
    user.passwordConfirm = request.body.passwordConfirm;
    await user.save();

    // 4- log the user in and send JWT
    await createSendToken(user, 200, response);
});

export default {
    signUp,
    logIn,
    protect,
    isLoggedIn,
    restrict,
    forgotPassword,
    resetPassword,
    updatePassword
};