const Student = require('../models/Student');
const Activity = require('../models/Activity');
const errorMessages = JSON.parse(process.env.ERROR_MESSAGES);

class ParticipationController {
    // [POST] /api/participations/:_activityId
    addParticipations = async (req, res) => {
        const _activityId = req.params._activityId;
        if (!mongoose.Types.ObjectId.isValid(_activityId)) {
            return res.status(400).json({ error: 'Invalid _activityId' });
        }
        const participations = req.body;
        if (!Array.isArray(participations)) {
            return res.status(400).json({ error: 'participations phải là một mảng' });
        }
        try {
            // Kiểm tra sự tồn tại của hoạt động
            const activity = await Activity.findById(_activityId);
            if (!activity) {
                return res.status(404).json({ error: 'Activity not found' });
            }
            await Activity.create(activity);
            // Thêm tất cả các sự tham gia vào hoạt động
            participations.forEach((participation) => {
                activity.participations.push({ student: participation._studentId, point: participation.point });
            });

            // Lưu lại hoạt động
            await activity.save();
            return res.json({ success: true, message: 'Ghi nhận ngày CTXH thành công' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: errorMessages.internalServerError });
        }
    };

    // [GET] /api/participations?page=&limit=
    showAllParticipations = async (req, res) => {
        const verifyResult = verifyToken(req);
        if (!verifyResult.success) {
            return res.status(403).json({ error: errorMessages.unauthorized });
        }
        // Lấy tham số trang và giới hạn từ yêu cầu
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        try {
            const activities = await Activity.find()
                .skip((page - 1) * limit)
                .limit(limit)
                .excec();
            const participations = activities.reduce();
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: errorMessages.internalServerError });
        }
    };
}
module.exports = new ParticipationController();
