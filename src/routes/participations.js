const express = require('express');
const router = express.Router();
const participationController = require('../app/controllers/ParticipationController');
const authorize = require('./middlewares/authorize');
const roles = JSON.parse(process.env.ROLES);
const [viewer, staff, editor, admin] = roles;

router.post('/:_activityId', participationController.addParticipations);
module.exports = router;
