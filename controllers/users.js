const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');
const AuthError = require('../errors/AuthError');
const ConflictError = require('../errors/ConflictError');

const { NODE_ENV, JWT_SECRET } = process.env;

function checkPassword(pass) {
  if (!pass || !pass.trim() || pass.length < 8) {
    throw new ValidationError('Невалидный пароль');
  }
} //* функция для проверки пробелов и длины пароля до хеширования

function getUser(req, res, next) {
  User.findById(req.user._id)
    .orFail(new Error('NullReturned'))

    .then((data) => {
      res.send({
        name: data.name,
        email: data.email,
      });
    })

    .catch((error) => {
      throw new NotFoundError(error.message);
    })

    .catch(next);
}

function createUser(req, res, next) {
  const {
    email,
    password,
    name,
  } = req.body;

  checkPassword(password);

  //* хешируем пароль с помощью модуля bcrypt, 10 - это длина «соли»,
  //* случайной строки, которую метод добавит к паролю перед хешированием, для безопасности
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email,
      password: hash, //* записали хеш в базу
      name,
    }))

    .then((data) => {
      res.send({
        _id: data._id,
        name: data.name,
        email: data.email,
      }); //* вернули документ из базы с записанными в него данными пользователя
    })

    .catch((error) => {
      if (error.name === 'MongoError' || error.code === 11000) {
        throw new ConflictError(error.message);
      }

      throw new ValidationError(error.message);
    })

    .catch(next);
}

//* если почта и пароль из запроса на авторизацию совпадают с теми, что есть в базе,
//* пользователь входит в аккаунт, иначе - получает сообщение об ошибке
function login(req, res, next) {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      ); //* создали jwt-токен сроком на неделю

      res.send({ token }); //* отправили токен пользователю
    })

    .catch((error) => {
      throw new AuthError(error.message);
    })

    .catch(next);
}

module.exports = {
  getUser,
  createUser,
  login,
};
