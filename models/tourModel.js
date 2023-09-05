// EXTERNAL
const mongoose = require('mongoose');


// define schema for tours documents inside database
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true
    },
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty']
    },
    ratingsAverage: {
        type: Number,
        default: 4.5
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: Number,
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a summary']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false   // disable this filed to be fetched and sent in output
    },
    startDates: [Date]

}, {
    toJSON: { virtuals: true },     // enable virtual properties/fields
    toObject: { virtuals: true }    // enable virtual properties/fields
});

// add virtual fields/properties into documents on retrieval
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

// create model from above document schema to be used to find/aggregate etc.
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;