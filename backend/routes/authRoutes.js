const router = require('express').Router();
const { signup, login, googleAuth, logout, me, forgotPassword, resetPassword } = require('../controllers/authController');
const { signupRules, loginRules, handleValidation } = require('../validators/authValidators');
const { requireAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/signup', authLimiter, signupRules, handleValidation, signup);
router.post('/login', authLimiter, loginRules, handleValidation, login);
router.post('/google', authLimiter, googleAuth);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

module.exports = router;
