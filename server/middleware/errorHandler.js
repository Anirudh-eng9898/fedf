/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err.stack);
  }

  res.status(statusCode).json({
    success: false,
    data: null,
    message: message,
    error: err.code || 'INTERNAL_ERROR'
  });
};

module.exports = errorHandler;
