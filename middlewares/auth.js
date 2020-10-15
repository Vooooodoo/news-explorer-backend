const jwt = require('jsonwebtoken');
const AuthError = require('../errors/AuthError');

const { NODE_ENV, JWT_SECRET } = process.env;

//* модуль для повторной авторизации пользователя по jwt-токену из запроса
module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  //* если jwt-токена нет в заголовке запроса - отправить ошибку
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new AuthError('Необходима авторизация');
  }

  //* если токен в наличии - извлечём только его, выкинув из заголовка приставку 'Bearer '
  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    //* убедимся что пользователь прислал именно тот токен, который был выдан ему ранее
    //* вторым аргументом передадим секретный ключ, которым выданный токен был подписан
    payload = jwt.verify(token, `${NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret'}`);
  } catch (error) {
    throw new AuthError('Необходима авторизация');
  }

  req.user = payload; //* записали пейлоуд в объект запроса

  next(); //* пропустили запрос дальше
};
