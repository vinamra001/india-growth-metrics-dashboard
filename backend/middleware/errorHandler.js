const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const details = err.details || 'An unexpected error occurred';

  res.status(statusCode).json({
    error: message,
    details
  });
};

module.exports = errorHandler;
