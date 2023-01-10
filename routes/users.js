const router = require('express').Router();
const {
  getUsers, getUserById, changeUserAvatar, changeUserInfo, getUserMe,
} = require('../controllers/users');
const auth = require('../middlewares/auth');

router.get('/users', auth, getUsers);

router.get('/users/me', auth, getUserMe);

router.get('/users/:userId', auth, getUserById);

router.patch('/users/me', auth, changeUserInfo);

router.patch('/users/me/avatar', auth, changeUserAvatar);

module.exports = router;
