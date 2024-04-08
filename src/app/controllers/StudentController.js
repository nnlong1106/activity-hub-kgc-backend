const mongoose = require('mongoose');
const StudentClass = require('../models/StudentClass');
const Student = require('../models/Student');
const errorMessages = JSON.parse(process.env.ERROR_MESSAGES);

class StudentController {
    // [POST] /api/students
    addStudentsByClassId = async (req, res) => {
        const { _classId, students } = req.body;

        try {
            if (!mongoose.Types.ObjectId.isValid(_classId)) {
                return res.status(400).json({ error: 'Invalid _classId' });
            }

            if (!Array.isArray(students)) {
                return res.status(400).json({ error: 'Students must be an array' });
            }

            const bulkStudents = students.map((student) => ({
                ...student,
                _classId: _classId,
                dateOfBirth: new Date(student.dateOfBirth),
            }));

            const createdStudents = await Student.create(bulkStudents);

            const result = await StudentClass.findByIdAndUpdate(_classId, {
                $push: { students: { $each: createdStudents.map((student) => student._id) } },
            });

            if (!result) {
                throw new Error('Failed to update student class');
            }

            res.json({ success: true, message: 'Thêm sinh viên thành công' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: errorMessages.internalServerError });
        }
    };

    // [GET] /api/students/:_id
    showStudentById = async (req, res) => {
        try {
            const _id = req.params._id;
            if (!mongoose.Types.ObjectId.isValid(_id)) {
                return res.status(400).json({ error: 'Invalid _id' });
            }
            const result = await Student.findById(_id);
            if (!result) {
                return res.status(404).json({ error: 'Không tìm thấy sinh viên' });
            }
            res.json({ success: true, result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: errorMessages.internalServerError });
        }
    };

    // [GET] /api/students?_classId=&page=&limit=&q=
    showStudents = async (req, res) => {
        // Xây dựng điều kiện tìm kiếm
        const searchConditions = {};

        // Kiểm tra nếu có classId, thêm điều kiện tìm kiếm theo classId
        const _classId = req.query._classId;
        if (_classId) {
            if (!mongoose.Types.ObjectId.isValid(_classId)) {
                return res.status(400).json({ error: 'Invalid _classId' });
            }
            searchConditions._classId = _classId;
        }

        //q chứa MSSV hoặc họ tên sinh viên
        const query = req.query.q;
        if (query) {
            const regexQuery = new RegExp(query.trim(), 'i'); // 'i' để không phân biệt chữ hoa chữ thường
            searchConditions.$or = [{ studentId: { $regex: regexQuery } }, { fullName: { $regex: regexQuery } }];
        }

        // Lấy tham số trang và giới hạn từ yêu cầu
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        try {
            const students = await Student.find(searchConditions)
                .skip((page - 1) * limit)
                .limit(limit)
                .exec();

            if (students.length === 0) {
                return res.status(404).json({ error: 'Không tìm thấy sinh viên' });
            }
            const totalStudents = students.length;
            const totalPages = Math.ceil(totalStudents / limit);
            return res.json({ success: true, totalPages, result: students });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: errorMessages.internalServerError });
        }
    };

    // [PUT] /api/students/:_id
    updateStudentById = async (req, res) => {
        try {
            // Lấy danh sách thông tin sinh viên cần cập nhật từ request body
            const updatedStudent = req.body;

            // Lấy ID của sinh viên từ thông tin cập nhật
            const _id = req.params._id;
            if (!mongoose.Types.ObjectId.isValid(_id)) {
                return res.status(400).json({ error: 'Invalid _id' });
            }
            // Cập nhật thông tin của sinh viên trong cơ sở dữ liệu
            const student = await Student.findByIdAndUpdate(_id, updatedStudent);
            student.save();
            console.log(student);
            res.status(200).json({ success: true, message: 'Cập nhật sinh viên thành công' });
        } catch (error) {
            console.log('updateStudents() error: ' + error);
            res.status(500).json({ error: errorMessages.internalServerError });
        }
    };
    // [PUT] /api/students
    updateStudents = async (req, res) => {
        try {
            // Lấy danh sách thông tin sinh viên cần cập nhật từ request body
            const updatedStudents = req.body;

            // Kiểm tra xem có sinh viên cần cập nhật không
            if (!updatedStudents || updatedStudents.length === 0) {
                return res.status(400).json({ error: 'Không có sinh viên được cập nhật' });
            }

            // Lặp qua mảng các sinh viên cần cập nhật
            for (const updatedStudent of updatedStudents) {
                // Lấy ID của sinh viên từ thông tin cập nhật
                const _id = updatedStudent._id;
                if (!mongoose.Types.ObjectId.isValid(_id)) {
                    return res.status(400).json({ error: 'Invalid _id' });
                }
                // Cập nhật thông tin của sinh viên trong cơ sở dữ liệu
                const student = await Student.findByIdAndUpdate(_id, updatedStudent);
                student.save();
                console.log(student);
            }
            res.status(200).json({ success: true, message: 'Cập nhật sinh viên thành công' });
        } catch (error) {
            console.log('updateStudents() error: ' + error);
            res.status(500).json({ error: errorMessages.internalServerError });
        }
    };

    // [DELETE] /api/students/:_id
    deleteStudentById = async (req, res) => {
        try {
            const { _id } = req.params;

            if (!mongoose.Types.ObjectId.isValid(_id)) {
                return res.status(400).json({ error: 'Invalid _id' });
            }
            const student = await Student.findById(_id);
            if (!student) {
                return res.status(404).json({ error: 'Không tìm thấy sinh viên' });
            }
            const _classId = student._classId;
            await Student.findByIdAndDelete(_id);
            await StudentClass.findByIdAndUpdate(_classId, { $pull: { students: _id } });

            console.log(`delete 1 student from ${_classId}: ${student}`);
            res.json({ success: true, message: `Xóa sinh viên thành công` });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: errorMessages.internalServerError });
        }
    };

    // [DELETE] /students
    deleteStudents = async (req, res) => {
        try {
            const _ids = req.body;

            for (const _id of _ids) {
                if (!mongoose.Types.ObjectId.isValid(_id)) {
                    return res.status(400).json({ error: 'Invalid _id' });
                }
                const student = await Student.findById(_id);
                if (!student) {
                    return res.status(404).json({ error: 'Không tìm thấy sinh viên' });
                }
                const _classId = student._classId;
                await Student.deleteOne({ _id });
                await StudentClass.updateOne({ _id: _classId }, { $pull: { students: _id } });
            }

            console.log(`delete ${_ids.length} students`);
            res.json({ success: true, message: `Xóa ${_ids.length} sinh viên thành công` });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: errorMessages.internalServerError });
        }
    };
}

module.exports = new StudentController();
