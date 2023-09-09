const AppError = require('./../utils/appError');

function handleCastErrorDB (err) {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
}

function handleDuplicateFieldsDB (err) {
    const message = `Duplicate field value: ${err.keyValue.name} - Please use another value`;
    return new AppError(message, 400);
}


function sendErrorDev (error, response) {
    response.status(error.statusCode).json({
        status: error.status,
        message: error.message,
        error: error,
        stack: error.stack
    });
}

function sendErrorPrd (error, response) {
    if (error.isOperational) {
        // Operational and trusted error: send message to client
        response.status(error.statusCode).json({
            status: error.status,
            message: error.message,
        });
    } else {
        // Programming or other unknown errors: don't leak error details
        // 1 - log Error
        // console.error('ERROR! - ', error);
        // 2 - send error
        response.status(500).json({
            status: 'error',
            message: 'Something went wrong!'
        });
    }
}


function globalErrorHandler (error, request, response, next) {
    // console.log(error.stack);
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(error, response);
    } else if (process.env.NODE_ENV === 'production') {
        let err = JSON.parse(JSON.stringify(error));
        if (err.name === 'CastError') err = handleCastErrorDB(err);
        if (err.code === 11000) err = handleDuplicateFieldsDB(err);

        sendErrorPrd(err, response);
    }

    next();
};


module.exports = {
    globalErrorHandler: globalErrorHandler
};