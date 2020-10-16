const router = require('express').Router();
const articlesRouter = require('./articles');
const usersRouter = require('./users');
const NotFoundError = require('../errors/NotFoundError');

router.use('/articles', articlesRouter);
router.use('/users', usersRouter);

router.use('*', () => {
  throw new NotFoundError('Запрашиваемый ресурс не найден');
});

module.exports = router;
