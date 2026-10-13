const cloudinary = require('cloudinary').v2;
require('./loadEnv');

// Trim defensively — a stray trailing space/CRLF pasted into .env (common on
// Windows) makes a value "truthy" but invalid, which Cloudinary rejects with
// an unhelpful error. Trimming here turns that into "just works".
const CLOUD_NAME = (process.env.CLOUDINARY_CLOUD_NAME || '').trim();
const API_KEY = (process.env.CLOUDINARY_API_KEY || '').trim();
const API_SECRET = (process.env.CLOUDINARY_API_SECRET || '').trim();

const missing = [
  !CLOUD_NAME && 'CLOUDINARY_CLOUD_NAME',
  !API_KEY && 'CLOUDINARY_API_KEY',
  !API_SECRET && 'CLOUDINARY_API_SECRET',
].filter(Boolean);

const isConfigured = missing.length === 0;

if (isConfigured) {
  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
    secure: true,
  });
} else if (process.env.NODE_ENV !== 'production') {
  console.warn(
    `⚠ Image storage (Cloudinary) is not fully configured — missing: ${missing.join(', ')}. ` +
    `Set these in backend/.env, then restart the server. Image uploads will return a clear ` +
    `error until then; everything else works normally.`
  );
}

/**
 * Uploads a file buffer to Cloudinary and returns { url, publicId }.
 * Throws a clear error if Cloudinary isn't configured, rather than
 * silently failing or faking a URL.
 */
function uploadBuffer(buffer, folder = 'luxora-watches/products') {
  if (!isConfigured) {
    return Promise.reject(
      new Error(`Image storage is not configured. Set ${missing.join(', ')} in backend/.env, then restart the server.`)
    );
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
      (err, result) => {
        if (err) return reject(err);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

function deleteImage(publicId) {
  if (!isConfigured || !publicId) return Promise.resolve();
  return cloudinary.uploader.destroy(publicId).catch((err) => {
    console.error('Failed to delete Cloudinary image:', err.message);
  });
}

module.exports = { uploadBuffer, deleteImage, isConfigured };
