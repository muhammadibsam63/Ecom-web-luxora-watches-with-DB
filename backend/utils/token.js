const jwt = require('jsonwebtoken');

function generateToken(userId, role) {
  return jwt.sign({ sub: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

const COOKIE_NAME = 'luxora_token';

function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: '/' });
}

module.exports = { generateToken, verifyToken, setAuthCookie, clearAuthCookie, COOKIE_NAME };
