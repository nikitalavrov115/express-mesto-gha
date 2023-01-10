const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundErr = require('../errors/not-found-err');
const BadRequestErr = require('../errors/bad-request-err');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
};

module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundErr('Запрашиваемый пользователь не найден');
      }

      res.send({
        name: user.name, about: user.about, avatar: user.avatar, _id: user._id,
      });
    })
    .catch(next);
};

module.exports.getUserMe = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundErr('Запрашиваемый пользователь не найден');
      }

      res.send({
        name: user.name, about: user.about, avatar: user.avatar, _id: user._id,
      });
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    email, password, name, about, avatar,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email, password: hash, name, about, avatar,
    }))
    .then((users) => res.send({ data: users }))
    .catch((e) => {
      if (e.code === 11000) {
        const error = new Error('Данный email уже существует в базе');
        error.statusCode = 409;
        next(error);
      }
    })
    .catch(next);
};

module.exports.changeUserInfo = (req, res, next) => {
  const { name, about } = req.body;

  if (!name || !about || !(typeof name === 'string') || !(typeof about === 'string')) {
    throw new BadRequestErr('Ошибка валидации');
  } else {
    User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
      .then((user) => {
        if (!user) {
          throw new NotFoundErr('Запрашиваемый пользователь не найден');
        } else {
          res.send({ data: user });
        }
      })
      .catch(next);
  }
};

module.exports.changeUserAvatar = (req, res, next) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        throw new NotFoundErr('Запрашиваемый пользователь не найден');
      } else {
        res.send({ data: user });
      }
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      if (!user) {
        throw new NotFoundErr('Запрашиваемый пользователь не найден');
      }

      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
      res.cookie('jwt', token, { maxAge: 604800000, httpOnly: true }).end();
    })
    .catch(next);
};
