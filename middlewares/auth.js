const jwt = require('jsonwebtoken');
const UnauthorizedErr = require('../errors/unauthorized-err');

module.exports = (req, res, next) => {
  const { cookie } = req.headers;

  if (!cookie || !cookie.startsWith('jwt=')) {
    next(new UnauthorizedErr('Необходима авторизация'));
  }

  const token = cookie.replace('jwt=', '');
  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    next(new UnauthorizedErr('Необходима авторизация'));
  }

  req.user = payload;
  next();
  return null;
};
