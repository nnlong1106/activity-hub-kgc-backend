const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const errorMessages = JSON.parse(process.env.ERROR_MESSAGES);
const { verifyToken } = require('../../utils/jwt');
const roles = JSON.parse(process.env.ROLES);
const [editor, admin] = roles;

class ActivityController {
    // [POST] /api/activities
    addActivity = async (req, res) => {
        try {
            const { title, date, semester, year, organization, description } = req.body;
            if (!(title && semester && year && organization)) {
                return res.status(400).json({ error: 'Cần nhập đủ các trường bắt buộc' });
            }
            const newActivityInfo = { title, date, semester, year, organization, description };
            const user = req.user;
            if (user.role === editor || user.role === admin) {
                newActivityInfo.approved = true;
            } else {
                newActivityInfo.approved = false;
            }
            const newActivity = await Activity.create(newActivityInfo);
            console.log(`Add 1 activity: ${newActivity}`);
            return res.json({ success: true, message: 'Thêm hoạt động thành công' });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: errorMessages.internalServerError,
            });
        }
    };
    // [GET] /api/activities/:_id
    showActivityById = async (req, res) => {
        try {
            const _id = req.params._id;
            if (!mongoose.Types.ObjectId.isValid(_id)) {
                return res.status(400).json({ error: 'Invalid _id' });
            }
            const activity = await Activity.findOne({ _id, approved: true });
            if (!activity) {
                return res.status(404).json({ error: 'Không tìm thấy hoạt động' });
            }
            return res.json({ success: true, result: activity });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: errorMessages.internalServerError,
            });
        }
    };
    // [GET] /api/activities?page=&limit=&year=&semester&organization=&title=
    showActivities = async (req, res) => {
        try {
            const { title, year, semester, organization } = req.query;
            const searchConditions = { approved: true };
            if (year) {
                searchConditions.year = year;
            }
            if (semester) {
                searchConditions.semester = semester;
            }
            if (organization) {
                searchConditions.organization = organization;
            }
            if (title) {
                const regexQuery = new RegExp(title.trim(), 'i');
                searchConditions.title = { $regex: regexQuery };
            }
            // Lấy tham số trang và giới hạn từ yêu cầu
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const activities = await Activity.find(searchConditions)
                .skip((page - 1) * limit)
                .limit(limit)
                .exec();

            if (activities.length === 0) {
                return res.status(404).json({ error: 'Không tìm thấy hoạt động' });
            }
            return res.json({ success: true, result: activities });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: errorMessages.internalServerError,
            });
        }
    };

    // [GET] /api/activities/unapproved?page=&limit=&year=&semester&organization=&title=
    showUnapprovedActivities = async (req, res) => {
        try {
            const { title, year, semester, organization, q } = req.query;
            const searchConditions = { approved: false };
            if (year) {
                searchConditions.year = year;
            }
            if (semester) {
                searchConditions.semester = semester;
            }
            if (organization) {
                searchConditions.organization = organization;
            }
            if (title) {
                const regexQuery = new RegExp(title.trim(), 'i');
                searchConditions.title = { $regex: regexQuery };
            }
            // Lấy tham số trang và giới hạn từ yêu cầu
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const activities = await Activity.find(searchConditions)
                .skip((page - 1) * limit)
                .limit(limit)
                .exec();

            if (activities.length === 0) {
                return res.status(404).json({ error: 'Không tìm thấy hoạt động' });
            }
            return res.json({ success: true, result: activities });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: errorMessages.internalServerError,
            });
        }
    };

    // [PUT] /api/activities/:_id
    editActivityById = async (req, res) => {
        try {
            const _id = req.params._id;
            if (!mongoose.Types.ObjectId.isValid(_id)) {
                return res.status(400).json({ error: 'Invalid _id' });
            }
            const { title, date, semester, year, organization, description } = req.body;
            const update = { title, date, semester, year, organization, description };

            for (const field in update) {
                if (!update[field]) {
                    delete update[field];
                }
            }
            const editedActivity = await Activity.findByIdAndUpdate(_id, update);
            if (!editedActivity) {
                return res.status(404).json({ error: 'Không tìm thấy hoạt động' });
            }
            console.log(`Update 1 activity: ${editedActivity}`);
            return res.json({ success: true, message: 'Cập nhật hoạt động thành công' });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: errorMessages.internalServerError,
            });
        }
    };
    // [DELETE] /api/activities/:_id
    deleteActivityById = async (req, res) => {
        try {
            const _id = req.params._id;
            if (!mongoose.Types.ObjectId.isValid(_id)) {
                return res.status(400).json({ error: 'Invalid _id' });
            }
            const deleledActivity = await Activity.findByIdAndDelete(_id);
            if (!deleledActivity) {
                return res.status(404).json({ error: 'Không tìm thấy hoạt động' });
            }
            console.log(`delete 1 activity: ${deleledActivity}`);
            return res.json({ success: true, message: 'Xóa hoạt động thành công' });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: errorMessages.internalServerError,
            });
        }
    };
    // [PATCH] /api/activities/approve/:_id
    approveActivity = async (req, res) => {
        try {
            const _id = req.params._id;
            const approvedActivity = await Activity.findByIdAndUpdate(_id, { approved: true });
            if (!approvedActivity) {
                return res.status(404).json({ error: 'Không tìm thấy hoạt động' });
            }
            console.log(`Approve 1 activity: ${_id}`);
            return res.json({ success: true, message: 'Duyệt hoạt động thành công' });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: errorMessages.internalServerError,
            });
        }
    };
}
module.exports = new ActivityController();
