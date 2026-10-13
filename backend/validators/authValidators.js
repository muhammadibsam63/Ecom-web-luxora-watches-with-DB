const { body, validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.unprocessable(
      'Please check the highlighted fields.',
      errors.array().map((e) => ({ field: e.path, message: e.msg }))
    );
  }
  next();
}

const signupRules = [
  body('fullName').trim().isLength({ min: 2, max: 150 }).withMessage('Full name is required.'),
  body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters.')
    .matches(/\d/)
    .withMessage('Password must include at least one number.'),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
];

module.exports = { handleValidation, signupRules, loginRules };
