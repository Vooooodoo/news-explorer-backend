const router = require('express').Router();
const articlesRouter = require('./articles');
const usersRouter = require('./users');
const auth = require('../middlewares/auth');
const { validateNewUser, validateLogin } = require('../middlewares/reqValidation');
const { createUser, login } = require('../controllers/users');
const NotFoundError = require('../errors/NotFoundError');

router.post('/signup', validateNewUser, createUser);
router.post('/signin', validateLogin, login);

router.use(auth);

router.use('/articles', articlesRouter);
router.use('/users', usersRouter);

router.use('*', () => {
  throw new NotFoundError('Запрашиваемый ресурс не найден');
});

module.exports = router;
