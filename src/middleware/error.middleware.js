/**
 * Global Error Handler Middleware
 */
const errorMiddleware = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }
  
  // Dump error to file for debugging
  try {
    require('fs').writeFileSync('latest_error.txt', JSON.stringify({ message: err.message, stack: err.stack, name: err.name }), 'utf8');
  } catch(e) {}

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorMiddleware;
