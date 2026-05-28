class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const sendSuccess = (res, data, statusCode = 200, meta = {}) => {
  res.status(statusCode).json({ success: true, ...meta, data });
};

module.exports = { AppError, asyncHandler, sendSuccess };
