const router = require('express').Router();
const { listCollections, getCollectionBySlug } = require('../controllers/collectionController');

router.get('/', listCollections);
router.get('/:slug', getCollectionBySlug);

module.exports = router;
