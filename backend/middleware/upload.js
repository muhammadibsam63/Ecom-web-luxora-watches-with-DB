const multer = require('multer');
const ApiError = require('../utils/ApiError');

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.memoryStorage(); // buffers held in memory only long enough to stream to Cloudinary

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return cb(ApiError.badRequest('Only JPG, PNG and WEBP images are allowed.'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 50 },
});

module.exports = upload;
