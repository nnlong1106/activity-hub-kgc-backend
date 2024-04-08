const express = require('express');
const router = express.Router();
const authorize = require('./middlewares/authorize');
const roles = JSON.parse(process.env.ROLES);
const [viewer, staff, editor, admin] = roles;
const activityController = require('../app/controllers/ActivityController');

router.post('/', authorize([staff, editor, admin]), activityController.addActivity);
router.get('/:_id', authorize(), activityController.showActivityById);
router.get('/unapproved', authorize([staff, editor, admin]), activityController.showUnapprovedActivities);
router.get('/', authorize(), activityController.showActivities);
router.put('/:_id', authorize([staff, editor, admin]), activityController.editActivityById);
router.patch('/approve/:_id', authorize([editor, admin]), activityController.approveActivity);
router.delete('/:_id', authorize([editor, admin]), activityController.deleteActivityById);

module.exports = router;
