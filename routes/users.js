const router = require('express').Router();
const {
  celebrate,
  Joi,
} = require('celebrate');
const {
  getUsers, getUserById, changeUserAvatar, changeUserInfo, getUserMe,
} = require('../controllers/users');
const auth = require('../middlewares/auth');

router.get('/users', auth, getUsers);

router.get('/users/me', auth, getUserMe);

router.get('/users/:userId', auth, celebrate({
  params: Joi.object().keys({
    userId: Joi.string().alphanum().length(24),
  }),
}), getUserById);

router.patch('/users/me', auth, celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), changeUserInfo);

router.patch('/users/me/avatar', auth, celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().regex(/https?:\/\/((w{3}\.)?[\w\-._~:?#[\]@!$&'\(\)*\+,;=])#?/), /* eslint-disable-line */
  }),
}), changeUserAvatar);

module.exports = router;
