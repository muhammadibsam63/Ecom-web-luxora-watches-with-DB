const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { createReview, getProductReviews } = require('../controllers/reviewController');

router.get('/product/:productId', getProductReviews);
router.post('/', requireAuth, createReview);

module.exports = router;
