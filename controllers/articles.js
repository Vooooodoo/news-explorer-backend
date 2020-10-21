const Article = require('../models/article');
const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');

function getArticles(req, res, next) {
  Article.find({ owner: req.user._id })
    .orFail(new Error('У пользователя с таким id нет сохранённых статей'))

    .then((data) => {
      res.send(data);
    })

    .catch((error) => {
      throw new NotFoundError(error.message);
    })

    .catch(next);
}

function createArticle(req, res, next) {
  const {
    keyword, title, text, date, source, link, image,
  } = req.body;

  Article.create({
    keyword, title, text, date, source, link, image, owner: req.user._id,
  })
    .then((data) => {
      res.send(data);
    })

    .catch((error) => {
      throw new ValidationError(error.message);
    })

    .catch(next);
}

function removeArticle(req, res, next) {
  const currentUser = req.user._id;

  Article.findById(req.params.id)
    .orFail(new Error('Нет статьи с таким id'))

    .then((article) => {
      if (article.owner.toString() !== currentUser) {
        throw new ForbiddenError('Недостаточно прав для выполнения операции');
      }

      Article.deleteOne(article)
        .then((data) => {
          res.send(data);
        })

        .catch(next);
    })

    .catch((error) => {
      throw new NotFoundError(error.message);
    })

    .catch(next);
}

module.exports = {
  getArticles,
  createArticle,
  removeArticle,
};
