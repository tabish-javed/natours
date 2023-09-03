/* eslint-disable no-console */
// INTERNAL
require('dotenv').config({ path: './config.env' });
// EXTERNAL
const mongoose = require('mongoose');
// CUSTOM
const app = require('./app');
//---------------------------------------------------

// mongoDB Connection Setup
const DB_URL = process.env.DB_CONNECT_STRING
    .replace('<USERNAME>', process.env.DB_USERNAME)
    .replace('<PASSWORD>', process.env.DB_PASSWORD)
    .replace('<DB>', 'natours');

mongoose.connect(DB_URL).then(() => console.log('Successfully connected to Database...'));


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

const Tour = mongoose.model('Tour', tourSchema);


// Server Startup
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`API server started on port: ${port}`);
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});
