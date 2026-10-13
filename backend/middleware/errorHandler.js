const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let error = err;

  // Postgres unique violation
  if (err.code === '23505') {
    error = ApiError.conflict('That value already exists.');
  }
  // Postgres foreign key violation
  else if (err.code === '23503') {
    error = ApiError.badRequest('Related resource not found.');
  }
  // Multer upload errors (file too large, too many files, etc.)
  else if (err.name === 'MulterError') {
    const messages = {
      LIMIT_FILE_SIZE: 'Each image must be under 5MB.',
      LIMIT_FILE_COUNT: 'You can upload up to 10 images at a time.',
      LIMIT_UNEXPECTED_FILE: 'Unexpected file field.',
    };
    error = ApiError.badRequest(messages[err.code] || 'Image upload failed.');
  }
  // JSON body parse error
  else if (err.type === 'entity.parse.failed') {
    error = ApiError.badRequest('Malformed request body.');
  }
  else if (!(err instanceof ApiError)) {
    console.error('Unhandled error:', err);
    error = ApiError.internal();
  }

  const status = error.statusCode || 500;
  const payload = {
    success: false,
    message: error.message || 'Something went wrong.',
  };
  if (error.details) payload.details = error.details;
  if (process.env.NODE_ENV !== 'production' && status === 500) {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
}

function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found.` });
}

module.exports = { errorHandler, notFoundHandler };
