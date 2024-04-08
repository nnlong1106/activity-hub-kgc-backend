const express = require('express');
const router = express.Router();
const authenticateController = require('../app/controllers/AuthenticateController');
const authorize = require('./middlewares/authorize');

router.post('/reset-password', authorize(), authenticateController.resetPassword);
router.post('/register/verify-otp', authenticateController.verifyRegisterOTP);
router.post('/register', authenticateController.register);
router.post('/forget-password/verify-otp', authenticateController.verifyForgetPasswordOTP);
router.post('/forget-password', authenticateController.forgetPassword);
router.post('/', authenticateController.authenticate);

module.exports = router;
