const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const {
  celebrate,
  Joi,
  errors,
} = require('celebrate');
require('dotenv').config();

const userRouter = require('./routes/users');
const cardRouter = require('./routes/cards');
const {
  login,
  createUser,
} = require('./controllers/users');

const app = express();

app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.use('/', userRouter);
app.use('/', cardRouter);
app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().regex(/https?:\/\/((w{3}\.)?[\w\-._~:?#[\]@!$&'\(\)*\+,;=])#?/), /* eslint-disable-line */
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), createUser);

app.use((req, res, next) => {
  res.status(404).send({ message: 'Запрашиваемый роут не найден' });
  next();
});

app.use(errors());

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;

  res.status(statusCode).send({
    message: statusCode === 500
      ? 'На сервере произошла ошибка'
      : message,
  });
  next();
});

app.listen(process.env.PORT || 3000);
