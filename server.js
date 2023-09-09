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
mongoose.connect(DB_URL)
    .then(() => {
        console.log('Connected to Database!');
        // Server Startup

    })
    .catch(error => {
        console.log(error.message);
        console.log('Can not connect to Database, exiting...');
        server.close(() => {
            process.exit(1);
        });
    });


const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`API server started on port: ${port}`);
});


process.on('unhandledRejection', error => {
    console.log(error.name, error.message);
    console.log('DB CONNECTION LOST...EXITING...');
    server.close(() => {
        process.exit(1);
    });
});

mongoose.connection.on('open', () => console.log('connecting...'));

// // enable graceful shutdown
// process.on('SIGINT', () => {
//     console.log('SIGINT signal received: closing HTTP server');
//     server.close(() => {
//         console.log('HTTP server closed');
//     });
// });
