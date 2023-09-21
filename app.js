// INTERNAL
// EXTERNAL
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
// CUSTOM
const AppError = require('./utils/appError');
const errorController = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');


const app = express();

// GLOBAL MIDDLEWARES
// global middleware for setting up security HTTP headers
app.use(helmet());

// third-party middleware to enable logging (only in development environment)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// global middleware - to limit number of request from specific IP
const rateLimitOptions = {
    max: 100,
    windowMs: 60 * 60 * 1_000,
    message: "Too many request from this IP, please try again in an hour!"
};
app.use('/api', rateLimit(rateLimitOptions));


// global middleware - to receive jason.parse()ed JS-Object from request's body (which is in JSON)
app.use(express.json({ limit: '10kb' }));


// global middleware - data sanitization against NoSQL query injection
app.use(mongoSanitize());   // <-- external library for data sanitization


// global middleware - data sanitization against XSS
app.use(xss());


// global middleware - serves public files
app.use(express.static(`${__dirname}/public`));


// global test middleware - adding time to the request object
app.use((request, response, next) => {
    mongoose.sanitizeFilter(request.body);  // <-- mongoDB's internal method for data sanitization
    request.requestTime = new Date().toISOString();
    next();
});


// middleware to send request accordingly to desired routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);


// bottom middleware 2 - custom (handling all other URLs)
app.all('*', function (request, response, next) {
    // response.status(404).json({
    //     status: 'failed',
    //     message: `Can't find ${request.url} on this server!`
    // });
    // next();

    // const error = new Error(`Can't find ${request.url} on this server!`);
    // error.status = 'failed';
    // error.statusCode = 404;
    // next(error)

    next(new AppError(`Can't find ${request.url} on this server!`, 404));
});


// error handling middleware
app.use(errorController.globalErrorHandler);

module.exports = app;