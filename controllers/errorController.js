function globalErrorHandler (error, request, response, next) {
    // console.log(error.stack);

    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    response.status(error.statusCode).json({
        status: error.status,
        message: error.message
    });
    next();
};


module.exports = {
    globalErrorHandler: globalErrorHandler
};