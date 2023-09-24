import AppError from '../utils/appError.js';
import User from './../models/userModel.js';
import catchAsync from './../utils/catchAsync.js';
import factory from './handlerFactory.js';


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


const deactivateMe = catchAsync(async function (request, response) {
    await User.findByIdAndUpdate(request.user.id, {
        active: false,
        passwordChangedAt: Date.now()
    });

    response.status(204).json({
        status: 'success',
        data: null
    });
});


function createUser (request, response) {
    response.status(500).json({
        status: 'error',
        message: 'This route is not yet defined! Please use /signup instead.'
    });
}


const getUser = factory.getOne(User);
const getAllUsers = factory.getAll(User);

// Do NOT update password with this
const updateUser = factory.updateOne(User);
const deleteUser = factory.deleteOne(User);

export default {
    updateMe,
    deactivateMe,
    createUser,
    getUser,
    getAllUsers,
    updateUser,
    deleteUser
};