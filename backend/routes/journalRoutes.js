const router = require('express').Router();
const { listArticles, getArticleBySlug } = require('../controllers/journalController');

router.get('/', listArticles);
router.get('/:slug', getArticleBySlug);

module.exports = router;
