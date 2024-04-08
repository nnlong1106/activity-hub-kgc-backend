const User = require('../models/User');
const errorMessages = process.env.ERROR_MESSAGES;
const roles = JSON.parse(process.env.ROLES);
const [viewer, staff, editor, admin] = roles;

class UserController {
    // [POST] /api/users/editor
    addEditor = async (req, res) => {
        try {
            const newUserInfo = req.body;
            newUserInfo.role = roles.editor;
            const { username, password, name } = newUserInfo;
            if (!(username && password && name)) {
                return res.status(400).json({ error: 'Cần nhập đủ các trường bắt buộc' });
            }
            // Kiểm tra định dạng email hợp lệ
            const emailRegex = /^[a-zA-Z0-9._%+-]+@kgc\.edu\.vn$/i;
            if (!emailRegex.test(username)) {
                return res.status(400).json({ error: 'Định dạng email không hợp lệ.' });
            }
            const result = await User.create(newUserInfo);
            console.log(`Add 1 user: ${result}`);
            res.json({ success: true, result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: errorMessages.internalServerError });
        }
    };
    // [POST] /api/users
    addUser = async (req, res) => {
        try {
            const newUserInfo = req.body;
            const { username, password, name, role } = newUserInfo;
            if (!(username && password && name && role)) {
                return res.status(400).json({ error: 'Cần nhập đủ các trường bắt buộc' });
            }
            if (!roles.includes(role)) {
                return res.status(400).json({ error: 'Role không hợp lệ' });
            }
            if (role === admin || role === editor) {
                return res.status(403).json({ error: errorMessages.forbidden });
            }
            // Kiểm tra định dạng email hợp lệ
            const emailRegex = /^[a-zA-Z0-9._%+-]+@kgc\.edu\.vn$/i;
            if (!emailRegex.test(username)) {
                return res.status(400).json({ error: 'Định dạng email không hợp lệ.' });
            }
            const result = await User.create(newUserInfo);
            console.log(`Add 1 user: ${result}`);
            res.json({ success: true, message: 'Thêm tài khoản thành công' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: errorMessages.internalServerError });
        }
    };
    // [GET] /users?page=&limit=&username=&name&role
    showUsers = async (req, res) => {
        try {
            const searchConditions = {}; // Khởi tạo đối tượng điều kiện tìm kiếm
            const query = req.query;

            for (const key in query) {
                if (query[key] && key !== 'page' && key !== 'limit') {
                    const regexQuery = new RegExp(query[key].trim(), 'i');
                    // Thêm điều kiện tìm kiếm vào đối tượng searchConditions
                    searchConditions[key] = { $regex: regexQuery };
                }
            }

            // Lấy tham số trang và giới hạn từ yêu cầu
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const users = await User.find(searchConditions)
                .skip((page - 1) * limit)
                .limit(limit)
                .exec();
            if (users.length === 0) {
                return res.status(404).json({ error: 'Không tìm thấy người dùng' });
            }
            res.json({ success: true, result: users });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: errorMessages.internalServerError });
        }
    };
    // [PATCH] /users/rename
    renameUser = async (req, res) => {
        const { username } = req.user;

        const name = res.body.name;
        if (!name) {
            return res.status(400).json({ error: 'Trường tên không được rỗng' });
        }
        try {
            const updatedUser = await User.findOneAndUpdate({ username }, { name });
            if (!updatedUser) {
                return res.status(404).json({ error: 'Không tìm thấy người dùng' });
            }
            res.json({ success: true, message: 'Cập nhật thông tin người dùng thành công' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: errorMessages.internalServerError });
        }
    };
}

module.exports = new UserController();
