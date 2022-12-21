const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const userRouter = require('./routes/users');
const cardRouter = require('./routes/cards');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.use((req, res, next) => {
  req.user = {
    _id: '63a2dc2dd43bde4d2f6b0ecb',
  };

  next();
});

app.use('/', userRouter);
app.use('/', cardRouter);

app.use((req, res, next) => {
  res.status(404).send({ message: 'Запрашиваемый роут не найден' });
  next();
});

app.listen(3000);
