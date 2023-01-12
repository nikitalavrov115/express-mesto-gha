const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundErr = require('../errors/not-found-err');

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
        email: user.email, name: user.name, about: user.about, avatar: user.avatar, _id: user._id,
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
    .then((user) => res.send({
      email: user.email, name: user.name, about: user.about, avatar: user.avatar, _id: user._id,
    }))
    .catch((e) => {
      if (e.code === 11000) {
        const error = new Error('Данный email уже существует в базе');
        error.statusCode = 409;
        next(error);
      }
    })
    .catch(next);
};

function changeUser(req, res, next, data) {
  User.findByIdAndUpdate(req.user._id, data, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        throw new NotFoundErr('Запрашиваемый пользователь не найден');
      } else {
        res.send({ data: user });
      }
    })
    .catch(next);
}

module.exports.changeUserInfo = (req, res, next) => {
  const { name, about } = req.body;

  changeUser(req, res, next, { name, about });
};

module.exports.changeUserAvatar = (req, res, next) => {
  const { avatar } = req.body;

  changeUser(req, res, next, { avatar });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      if (!user) {
        throw new NotFoundErr('Запрашиваемый пользователь не найден');
      }

      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
      res.cookie('jwt', token, { maxAge: 604800000, httpOnly: true });
      res.status(200).send({ jwt: token });
    })
    .catch(next);
};
