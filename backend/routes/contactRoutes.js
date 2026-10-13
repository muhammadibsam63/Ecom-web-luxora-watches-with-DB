const router = require('express').Router();
const { submitMessage } = require('../controllers/contactController');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/', authLimiter, submitMessage);

module.exports = router;
