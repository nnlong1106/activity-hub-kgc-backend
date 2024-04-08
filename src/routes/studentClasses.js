const express = require('express');
const router = express.Router();
const studentClassController = require('../app/controllers/StudentClassController');
const authorize = require('./middlewares/authorize');
const roles = JSON.parse(process.env.ROLES);
const [editor, admin] = roles;

router.post('/', authorize([editor, admin]), studentClassController.addClass);
router.get('/:_id', authorize(), studentClassController.showClassById);
router.get('/', authorize(), studentClassController.showClasses);
router.put('/:_id', authorize([editor, admin]), studentClassController.editClassById);
router.delete('/:_id', authorize([editor, admin]), studentClassController.deleteClass);

module.exports = router;
