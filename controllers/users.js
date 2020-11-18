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
    .orFail(new Error('Нет пользователя с таким id'))

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

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
      name,
    }))

    .then((data) => {
      res.send({
        _id: data._id,
        name: data.name,
        email: data.email,
      });
    })

    .catch((error) => {
      if (error.name === 'MongoError' || error.code === 11000) {
        throw new ConflictError('Пользователь с таким email уже существует.');
      }

      throw new ValidationError(error.message);
    })

    .catch(next);
}

function login(req, res, next) {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );

      res.send({ token, name, email });
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
