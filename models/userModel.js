import crypto from 'crypto';
import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name'],
        trim: true,
        // 1- match: /^[a-z\s]+$/gi,   // <-- either match OR validate works, validate has message property.
        validate: {
            validator: function () {
                return /^[a-z\s]+$/gi.test(this.name);
            },
            message: 'Name should only contain alphabetic characters.'
        }
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please enter a valid email address']
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
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
    },
    passwordResetToken: {
        type: String
    },
    passwordResetExpires: {
        type: Date
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

// Setting up hook/middleware - for encrypting user supplied password just before saving to DB.
// works only on save() or create()
userSchema.pre('save', async function (next) {
    // only run this function if password was actually modified
    if (!this.isModified('password')) return next();
    // hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    // delete the passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});

// Setting up hook/middleware - to save passwordChangedAt property on user document/object,
// except when password field was directly modified or this is very first entry, if so,
// this hook doesn't do anything and pass the request to next middleware.;
userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - (2 * 1_000);
    next();
});


// this hook/middleware works for all queries with find*. In here query is modified to return
// only those documents where action property/field is not set to "false".
// userSchema.pre(/^find/, function (next) {   // this points to current query
//     this.find({ active: { $ne: false } });
//     next();
// });


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


userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1_000;

    return resetToken;
};


const User = mongoose.model('User', userSchema);

export default User;