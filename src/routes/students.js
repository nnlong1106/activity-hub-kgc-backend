const express = require('express');
const router = express.Router();
const studentController = require('../app/controllers/StudentController');
const authorize = require('./middlewares/authorize');
const roles = JSON.parse(process.env.ROLES);
const [editor, admin] = roles;

router.post('/', authorize([editor, admin]), studentController.addStudentsByClassId);
router.get('/:_id', authorize(), studentController.showStudentById);
router.get('/', authorize(), studentController.showStudents);
router.put('/:_id', authorize([editor, admin]), studentController.updateStudentById);
router.put('/', authorize([editor, admin]), studentController.updateStudents);
router.delete('/:_id', authorize([editor, admin]), studentController.deleteStudentById);
router.delete('/', authorize([editor, admin]), studentController.deleteStudents);

module.exports = router;
