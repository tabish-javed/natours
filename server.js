/* eslint-disable no-console */
// INTERNAL
require('dotenv').config({ path: './config.env' });
// EXTERNAL
const mongoose = require('mongoose');
// CUSTOM
const app = require('./app');
//---------------------------------------------------

process.on('uncaughtException', error => {
    console.log('Uncaught Exception, Exiting...');
    console.log(error.message);
    server.close(() => {
        process.exit(1);
    });
});

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
    })
    .catch(error => {
        console.log(error.message);
        console.log('Can not connect to Database, Exiting...');
        server.close(() => {
            process.exit(1);
        });
    });


// Server Startup
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`API server started on port: ${port}`);
});


process.on('unhandledRejection', error => {
    console.log('Database Connection Lost... Exiting...');
    console.log(error);
    server.close(() => {
        process.exit(1);
    });
});


mongoose.connection.on('open', () => console.log('Connecting...'));
