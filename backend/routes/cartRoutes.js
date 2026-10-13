const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { getCart, addToCart, updateCartItem, removeCartItem, clearCart } = require('../controllers/cartController');

router.use(requireAuth);
router.get('/', getCart);
router.post('/', addToCart);
router.patch('/:itemId', updateCartItem);
router.delete('/:itemId', removeCartItem);
router.delete('/', clearCart);

module.exports = router;
