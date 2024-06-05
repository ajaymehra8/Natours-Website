const AppError = require('../utils/appError');

//cast error handler
const handleCastErrorDb = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

//duplicate error handler
const handleDuplicateFieldErr = (err) => {
  const value = err.keyValue.name;
  const message = `Duplicate field value: ${value}. Please use another value`;
  return new AppError(message, 400);
};

//validation error
const handleValidationErr = (err) => {
  const errors = Object.values(err.errors).map((val) => val.message);
  const message = `Invalid input data ${errors.join(', ')}`;
  return new AppError(message, 400);
};

const sendErrDev = (err, req, res) => {
  // console.log(req.originalUrl, 'fs');
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
};

const sendErrProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      //OPERATIONAL, TRUSTED ERROR:Send message to client
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      //Programming or other unknown error:don't leak error details

      //1) log error
      // console.error('Error: ', err);

      //2)SEND  A GEenric message
      res.status(500).json({
        status: 'Error',
        message: 'Something went wrong',
      });
    }
  } else {
    if (err.isOperational) {
      //OPERATIONAL, TRUSTED ERROR:Send message to client
      res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message,
      });
    } else {
      //Programming or other unknown error:don't leak error details

      //2)SEND  A GEenric message
      res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: 'Please try again later',
      });
    }
  }
};

// JSON web error

const handleJsonError = (err, res) => {
  return new AppError('Invalid token, Please try again', 401);
};

const handleJWTExpiredError = (err, res) => {
  return new AppError(
    'Your token has expired, Please try again',
    401,
  );
};
const errorController = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'fail';
  let error = { ...err };
  error.message=err.message;
  if (process.env.NODE_ENV === 'development') {
    sendErrDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    if (err.name === 'CastError') {
      error = handleCastErrorDb(error);
    }
    if (err.code === 11000) error = handleDuplicateFieldErr(error);
    if (err.name === 'ValidationError')
      error = handleValidationErr(error);
    if (err.name === 'JsonWebTokenError')
      error = handleJsonError(error);
    if (err.name === 'TokenExpiredError') {
      error = handleJWTExpiredError(error);
    }
    sendErrProd(error,req, res);
  }
};
module.exports = errorController;
