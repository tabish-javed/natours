import AppError from './../utils/appError.js';

// error constructor functions
function handleCastErrorDB (err) {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
}

function handleDuplicateFieldsDB (err) {
  const message = `Duplicate field value: ${err.keyValue.name} - Please use another value`;
  return new AppError(message, 400);
}

function handleValidationErrorDB (err) {
  const message = Object.values(err.errors).map(element => element.message).join('. ');
  return new AppError(`Invalid Input Data: ${message}`, 400);

}

function handleJWTError () {
  return new AppError('Invalid token. Please log in again!', 401);
}

function handleJWTExpiredError () {
  return new AppError('Your token has expired! Please log in again', 401);
}


// send error functions
function sendErrorDev (error, request, response) {
  // API
  if (request.originalUrl.startsWith('/api')) {
    return response.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      error: error,
      stack: error.stack
    });
  }
  // RENDERED WEBSITE
  return response.status(error.statusCode).render('error', {
    title: 'Something went wrong!',
    message: error.message
  });
}


function sendErrorPrd (error, request, response) {
  // API
  if (request.originalUrl.startsWith('/api')) {
    if (error.isOperational) {
      // Operational and trusted error: send message to client
      return response.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    }
    // Programming or other unknown errors: don't leak error details
    return response.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }

  // RENDERED WEBSITE
  if (error.isOperational) {
    // Operational and trusted error: send message to client
    return response.status(error.statusCode).render('error', {
      title: 'Something went wrong!',
      message: error.message
    });
  }
  // Programming or other unknown errors: don't leak error details
  return response.status(error.statusCode).render('error', {
    title: 'Something went wrong!',
    message: 'Please try again later.'
  });
}


function globalErrorHandler (error, request, response, next) {
  // console.log(error.stack);
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, request, response);
  } else if (process.env.NODE_ENV === 'production') {
    // let err = JSON.parse(JSON.stringify(error)); <- some properties are missing when used
    let err = Object.assign(error); // <- Using Object.assign() works best.
    if (err.name === 'CastError') err = handleCastErrorDB(err);
    if (err.code === 11000) err = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') err = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') err = handleJWTError();
    if (err.name === 'TokenExpiredError') err = handleJWTExpiredError();

    sendErrorPrd(err, request, response);
  }
  next();
};

export default { globalErrorHandler };