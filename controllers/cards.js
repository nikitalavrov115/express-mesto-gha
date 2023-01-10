const Card = require('../models/card');
const NotFoundErr = require('../errors/not-found-err');
const ForbiddenErr = require('../errors/forbidden-err');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .populate(['owner', 'likes'])
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId).populate('owner', '_id')
    .then((card) => {
      if (!card) {
        throw new NotFoundErr('Запрашиваемая карточка не найдена');
      }
      if (card.owner._id.toHexString() === req.user._id) {
        Card.findByIdAndRemove(req.params.cardId)
          .then(() => {
            res.send({ data: card });
          });
      } else {
        throw new ForbiddenErr('Запрещено удалять чужие карточки');
      }
    })
    .catch(next);
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (!card) {
        throw new NotFoundErr('Запрашиваемая карточка не найдена');
      } else {
        res.send({ data: card });
      }
    })
    .catch(next);
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (!card) {
        throw new NotFoundErr('Запрашиваемая карточка не найдена');
      } else {
        res.send({ data: card });
      }
    })
    .catch(next);
};
