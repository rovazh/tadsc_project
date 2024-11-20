const { createUser, readUser, updateUser, deleteUser, readUsers } = require('../controller/user');
const router = require('express').Router();

router.post('/user', createUser);
router.get('/user/:id([a-z0-9]{24})', readUser);
router.put('/user/:id([a-z0-9]{24})', updateUser);
router.delete('/user/:id([a-z0-9]{24})', deleteUser);
router.get('/user/:id([a-z0-9]{24})', deleteUser);
router.get('/users', readUsers);

module.exports = router;
