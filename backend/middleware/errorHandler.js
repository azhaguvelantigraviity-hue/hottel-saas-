const logger = require('../utils/logger');

const errorHandler = (err, req, res, _next) => {
  let error = { ...err, message: err.message };

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = { message: `Resource not found`, statusCode: 404 };
  }
  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = { message: `${field} already exists`, statusCode: 400 };
  }
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(e => e.message).join(', ');
    error = { message, statusCode: 400 };
  }
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = { message: 'Invalid token', statusCode: 401 };
  }
  if (err.name === 'TokenExpiredError') {
    error = { message: 'Token expired', statusCode: 401 };
  }

  const statusCode = error.statusCode || err.statusCode || 500;

  if (statusCode >= 400) {
    logger.error(`${req.method} ${req.originalUrl} [${statusCode}] → ${err.message}`, { stack: err.stack });
  }

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
