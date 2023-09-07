/* eslint-disable no-console */
// INTERNAL
require('dotenv').config({ path: './config.env' });
// EXTERNAL
const mongoose = require('mongoose');
// CUSTOM
const app = require('./app');
//---------------------------------------------------

// mongoDB CONNECTION SETUP
// create URL string to connect mongoose with.
const DB_URL = process.env.DB_CONNECT_STRING
    .replace('<USERNAME>', process.env.DB_USERNAME)
    .replace('<PASSWORD>', process.env.DB_PASSWORD)
    .replace('<DB>', 'natours');


// connect to mongoDB database
mongoose.connect(DB_URL).then(() => console.log('Successfully connected to Database...'));


// Server Startup
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`API server started on port: ${port}`);
});


// // enable graceful shutdown
// process.on('SIGINT', () => {
//     console.log('SIGINT signal received: closing HTTP server');
//     server.close(() => {
//         console.log('HTTP server closed');
//     });
// });
