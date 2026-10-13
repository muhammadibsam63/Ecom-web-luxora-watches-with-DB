const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { getWishlist, addToWishlist, removeFromWishlist } = require('../controllers/wishlistController');

router.use(requireAuth);
router.get('/', getWishlist);
router.post('/', addToWishlist);
router.delete('/:productId', removeFromWishlist);

module.exports = router;
