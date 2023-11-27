import multer from 'multer';
import AppError from '../utils/appError.js';
import User from './../models/userModel.js';
import catchAsync from './../utils/catchAsync.js';
import factory from './handlerFactory.js';


// multer setup
const multerStorage = multer.diskStorage({
    destination: (request, file, cb) => {
        cb(null, 'public/img/users');
    },
    filename: (request, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        cb(null, `user-${request.user.id}-${Date.now()}.${ext}`);
    }
});

const multerFilter = (request, file, cb) => {
    if (file.mimetype.startsWith('image')) cb(null, true);
    else cb(new AppError('Not an image!, please upload only images.', 400), false);
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
// uploadUserPhoto is now a middleware to be called in userRoutes
const uploadUserPhoto = upload.single('photo');


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
    uploadUserPhoto,
    getMe,
    updateMe,
    deactivateMe,
    createUser,
    getUser,
    getAllUsers,
    updateUser,
    deleteUser
};