export const errorHandler = (err, req, res, next) => {
  console.error(`[Unhandled Error] ${err.stack || err.message}`);
  
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      status: statusCode,
      timestamp: new Date().toISOString()
    }
  });
};
