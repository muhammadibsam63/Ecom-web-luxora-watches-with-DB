const router = require('express').Router();
const { listTestimonials } = require('../controllers/testimonialController');

router.get('/', listTestimonials);

module.exports = router;
