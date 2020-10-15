const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');
const AuthError = require('../errors/AuthError');
const ConflictError = require('../errors/ConflictError');

const { NODE_ENV, JWT_SECRET } = process.env;

function getUser(req, res, next) {
  User.findById('5f885215f55be636481f72fc')
    .orFail(new Error('NullReturned'))

    .then((data) => {
      res.send(data);
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