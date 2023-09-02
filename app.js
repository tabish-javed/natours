// INTERNAL
// EXTERNAL
const express = require('express');
const morgan = require('morgan');
// CUSTOM
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');


const app = express();

// third-party middleware to enable logging
app.use(morgan('dev'));

// express middleware  - to receive jason.parse()ed JS-Object from request's body (which is in JSON)
app.use(express.json());

// middleware for public files
app.use(express.static(`${__dirname}/public`));

// middleware 1 - custom
app.use((request, response, next) => {
    // console.log(`${request.hostname}`);
    next();
});

// middleware 2 - custom
app.use((request, response, next) => {
    request.requestTime = new Date().toISOString();
    next();
});


// middleware to send request accordingly to desired routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);


module.exports = app;