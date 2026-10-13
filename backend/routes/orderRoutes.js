const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { createOrder, getMyOrders, getOrderById } = require('../controllers/orderController');

router.use(requireAuth);
router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);

module.exports = router;
