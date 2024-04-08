const mongoose = require('mongoose');

const StudentClass = require('../models/StudentClass');
const errorMessages = JSON.parse(process.env.ERROR_MESSAGES);
const { verifyToken } = require('../../utils/jwt');
const roles = JSON.parse(process.env.ROLES);
const [viewer, staff, editor, admin] = roles;

class StudentClassController {
    // [POST] /api/classes
    addClass = async (req, res) => {
        try {
            const newClassInfo = req.body;
            const { classId, faculty, major, system, course, startYear, endYear } = newClassInfo;
            if (!(classId && faculty && major && system && course && startYear && endYear)) {
                return res.status(400).json({ error: 'Cần nhập đủ các trường bắt buộc' });
            }

            newClassInfo.classId = classId.trim().toUpperCase();

            const result = await StudentClass.create(newClassInfo);
            console.log(`add studentClass: ${result}`);
            return res.json({ success: true, message: 'Thêm lớp thành công' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: errorMessages.internalServerError });
        }
    };

    // [GET] /api/classes/:_id
    showClassById = async (req, res) => {
        try {
            const _id = req.params._id;
            if (!mongoose.Types.ObjectId.isValid(_id)) {
                return res.status(400).json({ error: 'Invalid _id' });
            }
            const studentClass = await StudentClass.findById(_id);
            if (!studentClass) {
                return res.status(404).json({ error: 'Không tìm thấy lớp' });
            }
            return res.json({ success: true, result: studentClass });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: errorMessages.internalServerError });
        }
    };

    // [GET] /api/classes?classId=&fullName=&faculty=&major=&course=&startYear=&endYear=
    showClasses = async (req, res) => {
        const { classId, fullName, faculty, major, group, system, course, startYear, endYear } = req.query;
        // Tạo một đối tượng mới để lưu trữ điều kiện tìm kiếm
        const searchConditions = {};

        // Kiểm tra và thêm các trường vào đối tượng searchConditions nếu chúng tồn tại trong req.query
        if (classId) {
            searchConditions.classId = classId;
        }
        if (fullName) {
            searchConditions.fullName = fullName;
        }
        if (faculty) {
            searchConditions.faculty = faculty;
        }
        if (major) {
            searchConditions.major = major;
        }
        if (group) {
            searchConditions.major = group;
        }
        if (system) {
            searchConditions.major = system;
        }
        if (course) {
            searchConditions.course = course;
        }
        if (startYear) {
            searchConditions.startYear = startYear;
        }
        if (endYear) {
            searchConditions.endYear = endYear;
        }
        // Lấy tham số trang và giới hạn từ yêu cầu
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        try {
            const studentClasses = await StudentClass.find(searchConditions)
                .skip((page - 1) * limit)
                .limit(limit)
                .exec();
            if (studentClasses.length === 0) {
                return res.status(404).json({ error: 'Không tìm thấy lớp' });
            }
            const totalClasses = studentClasses.length;
            const totalPages = Math.ceil(totalClasses / limit);
            return res.json({ success: true, totalPages, result: studentClasses });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: errorMessages.internalServerError });
        }
    };

    // [PUT] /api/classes/:_id
    editClassById = async (req, res) => {
        try {
            const _id = req.params._id;
            if (!mongoose.Types.ObjectId.isValid(_id)) {
                return res.status(400).json({ error: 'Invalid _id' });
            }
            const { classId, faculty, major, group, system, course, startYear, endYear } = req.body;
            const update = {};

            if (classId) {
                update.classId = classId;
            }
            if (faculty) {
                update.faculty = faculty;
            }
            if (major) {
                update.major = major;
            }
            if (group) {
                update.group = group;
            }
            if (system) {
                update.system = system;
            }
            if (course) {
                update.course = course;
            }
            if (startYear) {
                update.startYear = startYear;
            }
            if (endYear) {
                update.endYear = endYear;
            }
            const studentClass = await StudentClass.findByIdAndUpdate(_id, update);
            if (!studentClass) {
                return res.status(404).json({ error: 'Không tìm thấy lớp' });
            }
            studentClass.save();
            console.log(`Edit 1 studentClass: ${studentClass}`);
            return res.json({ success: true, message: 'Sửa thông tin lớp thành công' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: errorMessages.internalServerError });
        }
    };

    // [DELETE] /api/classes/:_id
    deleteClass = async (req, res) => {
        try {
            const _id = req.params._id;
            if (!mongoose.Types.ObjectId.isValid(_id)) {
                return res.status(400).json({ error: 'Invalid _id' });
            }
            // Proceed with deleting the document
            const deletedClass = await StudentClass.findByIdAndDelete(_id);
            if (!deletedClass) {
                return res.status(404).json({ error: 'Không tìm thấy lớp' });
            }
            console.log(`delete class: ${deletedClass}`);
            return res.json({ success: true, message: 'Xóa lớp thành công' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: errorMessages.internalServerError });
        }
    };
}

module.exports = new StudentClassController();
