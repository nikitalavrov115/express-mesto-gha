const User = require('../models/user');

const BAD_REQUEST_ERROR_CODE = 400;
const NOT_FOUND_ERROR_CODE = 404;
const INTERNAL_SERVER_ERROR_CODE = 500;

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => res.status(INTERNAL_SERVER_ERROR_CODE).send({ message: 'На сервере произошла ошибка' }));
};

module.exports.getUserById = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => res.send({
      name: user.name, about: user.about, avatar: user.avatar, _id: user._id,
    }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(NOT_FOUND_ERROR_CODE).send({ message: 'Запрашиваемый пользователь не найден' });
      } else {
        res.status(INTERNAL_SERVER_ERROR_CODE).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((users) => res.send({ data: users }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(BAD_REQUEST_ERROR_CODE).send({ message: 'Ошибка валидации' });
      } else {
        res.status(INTERNAL_SERVER_ERROR_CODE).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.changeUserInfo = (req, res) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true })
    .then((user) => {
      if (!user) {
        res.status(NOT_FOUND_ERROR_CODE).send({ message: 'Запрашиваемый пользователь не найден' });
      } else {
        res.send({ data: user });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(NOT_FOUND_ERROR_CODE).send({ message: 'Запрашиваемый пользователь не найден' });
      } else if (err.name === 'ValidationError') {
        res.status(BAD_REQUEST_ERROR_CODE).send({ message: 'Ошибка валидации' });
      } else {
        res.status(INTERNAL_SERVER_ERROR_CODE).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.changeUserAvatar = (req, res) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(NOT_FOUND_ERROR_CODE).send({ message: 'Запрашиваемый пользователь не найден' });
      } else if (err.name === 'ValidationError') {
        res.status(BAD_REQUEST_ERROR_CODE).send({ message: 'Ошибка валидации' });
      } else {
        res.status(INTERNAL_SERVER_ERROR_CODE).send({ message: 'На сервере произошла ошибка' });
      }
    });
};
