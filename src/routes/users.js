const express = require('express');
const router = express.Router();

const userController = require('../app/controllers/UserController');
const authorize = require('./middlewares/authorize');
const roles = JSON.parse(process.env.ROLES);
const [viewer, staff, editor, admin] = roles;

router.post('/rename', authorize(), userController.renameUser);
router.post('/editor', authorize([admin]), userController.addEditor);
router.post('/', authorize([editor, admin]), userController.addUser);
router.get('/', authorize([editor, admin]), userController.showUsers);

module.exports = router;
