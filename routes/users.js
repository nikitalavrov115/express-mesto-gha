const router = require('express').Router();
const {
  getUsers, getUserById, createUser, changeUserAvatar, changeUserInfo,
} = require('../controllers/users');

router.get('/users', getUsers);

router.get('/users/:userId', getUserById);

router.post('/users', createUser);

router.patch('/users/me', changeUserInfo);

router.patch('/users/me/avatar', changeUserAvatar);

module.exports = router;
