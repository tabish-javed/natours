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
        minlength: 8
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
    }
});


userSchema.pre('save', async function (next) {
    // ONly run this function if password was actually modified
    if (!this.isModified('password')) return next();
    // has the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    // delete the passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});


const User = mongoose.model('User', userSchema);

module.exports = User;