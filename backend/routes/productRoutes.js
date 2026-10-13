const router = require('express').Router();
const { listProducts, getProductBySlug } = require('../controllers/productController');

router.get('/', listProducts);
router.get('/:slug', getProductBySlug);

module.exports = router;
