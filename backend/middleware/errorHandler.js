// Global error handling middleware
function errorHandler(err, req, res, next) {
  console.error('Error occurred:', err);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token'
    });
  }
  
  if (err.code === 'permission-denied') {
    return res.status(403).json({
      error: 'Permission Denied',
      message: 'You do not have permission to access this resource'
    });
  }
  
  // Default server error
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message
  });
}

module.exports = errorHandler;
