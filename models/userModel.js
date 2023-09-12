const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please enter a valid email address']
    },
    photo: {
        type: String
    },
    password: {
        type: String,
        required: [true, 'Please enter password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm the password'],
        validate: {
            // this only works on save() or create()
            validator: function (element) {
                return element === this.password;
            },
            message: 'Passwords are not matching'
        }
    },
    passwordChangedAt: {
        type: Date
    }
});

// setting up hook - for encrypting user supplied password just before saved to DB.
// works only on save() or create()
userSchema.pre('save', async function (next) {
    // only run this function if password was actually modified
    if (!this.isModified('password')) return next();
    // has the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    // delete the passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});


/**
 * This instance method available on all document objects. It compares
 * password supplied to logIn with the password stored in database.
 * @param {*} candidatePassword
 * @param {*} userPassword
 * @returns boolean
 */
userSchema.methods.isPasswordCorrect = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};


userSchema.methods.isPasswordChanged = function (JWTTimeStamp) {
    if (this.passwordChangedAt) {
        const changedTimeStamp = this.passwordChangedAt.getTime() / 1_000;
        return changedTimeStamp > JWTTimeStamp;
    }

    // false means password not changed
    return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;