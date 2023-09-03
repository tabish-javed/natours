// EXTERNAL
const mongoose = require('mongoose');


// define schema
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true
    },
    rating: {
        type: Number,
        default: 4.5
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    }
});


// create model from schema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;