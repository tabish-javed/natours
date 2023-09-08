// INTERNAL
// EXTERNAL
const express = require('express');
const morgan = require('morgan');
// CUSTOM
const AppError = require('./utils/appError');
const errorController = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');


const app = express();

// third-party middleware to enable logging (only in development environment)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// express middleware  - to receive jason.parse()ed JS-Object from request's body (which is in JSON)
app.use(express.json());

// middleware for public files
app.use(express.static(`${__dirname}/public`));

// middleware 1 - custom
app.use((request, response, next) => {
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