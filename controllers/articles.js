const Article = require('../models/article');
const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');

function getArticles(req, res, next) {
  Article.find({ owner: req.user._id })
    .then((data) => {
      res.send(data);
    })

    .catch(next);
}

function createArticle(req, res, next) {
  const {
    keyword, title, text, date, source, link, image,
  } = req.body;

  Article.create({
    keyword, title, text, date, source, link, image, owner: '5f885215f55be636481f72fc',
  })
    .then((data) => {
      res.send({
        _id: data._id,
        keyword: data.keyword,
        title: data.title,
        text: data.text,
        date: data.date,
        source: data.source,
        link: data.link,
        image: data.image,
      });
    })

    .catch((error) => {
      throw new ValidationError(error.message);
    })

    .catch(next);
}

function removeArticle(req, res, next) {
  const currentUser = req.user._id;

  Article.findById(req.params.id)
    .orFail(new Error('NullReturned'))

    .then((article) => {
      if (article.owner.toString() !== currentUser) {
        throw new ForbiddenError('Недостаточно прав для выполнения операции');
      }

      Article.findByIdAndDelete(req.params.id)
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
