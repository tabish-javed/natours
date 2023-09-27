/* eslint-disable no-console */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';

dotenv.config({ path: './config.env' });


process.on('uncaughtException', error => {
    console.log('Uncaught Exception, Exiting...');
    console.log(error.message);
    server.close(() => {
        process.exit(1);
    });
});


// Server Startup
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`API server started on port: ${port}`);
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


process.on('unhandledRejection', error => {
    console.log('Database Connection Lost... Exiting...');
    console.log(error);
    server.close(() => {
        process.exit(1);
    });
});


mongoose.connection.on('open', () => console.log('Connecting...'));
