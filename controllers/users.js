const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundErr = require('../errors/not-found-err');
const ConflictErr = require('../errors/conflict-err');

const { NODE_ENV, JWT_SECRET } = process.env;

function formatUserResponse(user) {
  return {
    name: user.name,
    about: user.about,
    avatar: user.avatar,
    _id: user._id,
  };
}

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

      res.send(formatUserResponse(user));
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
        name: user.name,
        email: user.email,
        about: user.about,
        avatar: user.avatar,
        _id: user._id,
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
    .then((user) => res.send(formatUserResponse(user)))
    .catch((e) => {
      if (e.code === 11000) {
        next(new ConflictErr('Данный email уже существует в базе'));
      } else {
        next(e);
      }
    });
};

module.exports.changeUser = (req, res, next) => {
  User.findByIdAndUpdate(req.user._id, req.body, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        throw new NotFoundErr('Запрашиваемый пользователь не найден');
      } else {
        res.send(formatUserResponse(user));
      }
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
      res.cookie('jwt', token, { maxAge: 604800000, httpOnly: true, sameSite: true });
      res.status(200).send({ jwt: token });
    })
    .catch(next);
};
