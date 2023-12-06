import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import sharp from 'sharp';
import AppError from '../utils/appError.js';
import User from './../models/userModel.js';
import catchAsync from './../utils/catchAsync.js';
import factory from './handlerFactory.js';


// MULTER SETUP

/* // When saving image to disk
    const multerStorage = multer.diskStorage({
    destination: (request, file, cb) => {
        cb(null, 'public/img/users');
    },
    filename: (request, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        cb(null, `user-${request.user.id}-${Date.now()}.${ext}`);
    }
}); */

// When saving image to memory buffer
const multerStorage = multer.memoryStorage();

const multerFilter = (request, file, cb) => {
    if (file.mimetype.startsWith('image')) cb(null, true);
    else cb(new AppError('Not an image!, please upload only images.', 400), false);
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

// uploadUserPhoto is now a middleware to be called in userRoutes
const uploadUserPhoto = upload.single('photo');


function resizeUserPhoto (request, response, next) {
    if (!request.file) return next();

    request.file.filename = `user-${request.user.id}-${Date.now()}.jpeg`;

    sharp(request.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${request.file.filename}`);

    next();
}


// UTILITY FUNCTIONS
// filter JS object to have only required fields to be updated
function filterObject (object, ...allowedFields) {
    const newObject = {};
    Object.keys(object).forEach(element => {
        if (allowedFields.includes(element)) {
            newObject[element] = object[element];
        }
    });

    return newObject;
}

// creating "__dirname" variable (unavailable by default in ES6 module system)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// delete the old photo when new photo is updated
async function deletePhotoFromStorage (photo) {
    if (photo.startsWith('default')) return;
    const path = `${__dirname}/../public/img/users/${photo}`;
    await fs.unlink(path, error => {
        if (error) return error;
    });
}


// ---- USERS CONTROLLERS ----

function getMe (request, response, next) {
    request.params.id = request.user.id;
    next();
}

// when user update his/her data i.e. email etc.
const updateMe = catchAsync(async function (request, response, next) {
    // 1- create error if user POSTed password data (if he/she tries to update password)
    if (request.body.password || request.body.passwordConfirm) {
        return next(new AppError('This route is not for password update. Please use /updatePassword', 400));
    }

    // 2- filter user object fields which shouldn't be saved, in other words;
    // specify only the fields which are supposed to be updated.
    const filteredBody = filterObject(request.body, 'name', 'email');
    if (request.file) filteredBody.photo = request.file.filename;

    // 3- if new photo is being updated then delete the old photo
    if (request.file) await deletePhotoFromStorage(request.user.photo);

    // 4- update user document
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
    uploadUserPhoto,
    resizeUserPhoto,
    getMe,
    updateMe,
    deactivateMe,
    createUser,
    getUser,
    getAllUsers,
    updateUser,
    deleteUser
};