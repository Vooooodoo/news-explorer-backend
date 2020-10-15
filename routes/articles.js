const router = require('express').Router();
const { validateId, validateArticle } = require('../middlewares/reqValidation');
const {
  getArticles,
  createArticle,
  removeArticle,
} = require('../controllers/articles');

router.get('/', getArticles);
router.post('/', validateArticle, createArticle);
router.delete('/:id', validateId, removeArticle);

module.exports = router;
