const User = require('../models/User');
const OTP = require('../models/OTP');
const Student = require('../models/Student');
const otpExpiredSeconds = parseInt(process.env.OTP_EXPIRED_SECONDS);
const errorMessages = JSON.parse(process.env.ERROR_MESSAGES);
const bcrypt = require('bcrypt');
const mailer = require('../../utils/mailer');
const { generateToken } = require('../../utils/jwt');
const salts = parseInt(process.env.SALTS);

class AuthenticateController {
    // [POST] /authenticate/register
    register = async (req, res) => {
        try {
            let { username, password, studentId } = req.body;
            studentId = studentId.toUpperCase();
            // Kiểm tra định dạng email hợp lệ
            const emailRegex = /^[a-zA-Z0-9._%+-]+@kgc\.edu\.vn$/i;
            if (!emailRegex.test(username)) {
                return res.status(400).json({ error: 'Định dạng email không hợp lệ.' });
            }

            // Kiểm tra nếu studentId không tồn tại
            const student = await Student.findOne({ studentId });
            if (!student) {
                return res.status(404).json({ error: 'MSSV không tồn tại' });
            }

            // Kiểm tra xem người dùng đã tồn tại trong cơ sở dữ liệu chưa
            const userExists = await User.exists({ studentId });
            if (userExists) {
                return res.status(409).json({ error: 'Người dùng đã tồn tại' });
            }

            // Gửi OTP qua email
            const otpResult = await mailer.sendOTP(username);
            if (otpResult.error) {
                console.error(otpResult.error);
                return res.status(500).json({ error: 'Đã xảy ra lỗi khi gửi OTP' });
            }

            // Mã OTP đã được gửi thành công, lưu thông tin user vào database với mật khẩu là OTP
            const result = await OTP.create({ email: username, otp: otpResult.otp, password, studentId });
            return res.json({
                success: true,
                message: 'OTP đã được gửi đến email của bạn',
                expiresAfterSeconds: otpExpiredSeconds,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Đã xảy ra lỗi khi đăng ký' });
        }
    };
    // [POST] /authenticate/resister/verify-otp
    verifyRegisterOTP = async (req, res, next) => {
        try {
            const { email, otp } = req.body;
            const otpResult = await OTP.findOne({ email, otp });

            if (!otpResult) {
                return res.status(401).json({ error: 'Xác thực OTP thất bại' });
            }
            const hashedPassword = bcrypt.hash(otpResult.password, salts);

            const result = await User.create({
                username: email,
                password: hashedPassword,
                studentId: otpResult.studentId,
            });
            console.log(`Add 1 user: ${result}`);
            return res.redirect('/login');
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: errorMessages.internalServerError,
            });
        }
    };
    //[POST] /authenticate/reset-password
    resetPassword = async (req, res, next) => {
        try {
            const user = req.user;
            const newPassword = req.body.newPassword;
            if (!newPassword) {
                return res.status(400).json({ error: 'Trường newPassword không được trống' });
            }
            const hashedPassword = await bcrypt.hash(newPassword, salts);
            // Cập nhật mật khẩu mới vào cơ sở dữ liệu
            await User.findOneAndUpdate({ username: user.username }, { password: hashedPassword });

            res.redirect('/login');
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: errorMessages.internalServerError,
            });
        }
    };
    //[POST] /authenticate/forget-password/verify-otp
    verifyForgetPasswordOTP = async (req, res, next) => {
        try {
            const { email, otp } = req.body;
            const otpResult = await OTP.findOne({ email, otp });

            if (!otpResult) {
                return res.status(401).json({ error: 'Xác thực OTP thất bại' });
            }
            const user = await User.findOne({ username: email }).select('-password -_id -active');
            const userInfo = user.toObject();

            const token = generateToken(userInfo);

            res.json({ success: true, message: 'Xác thực OTP thành công', token });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: errorMessages.internalServerError,
            });
        }
    };
    //[POST] /authenticate/forget-password
    forgetPassword = async (req, res) => {
        try {
            const { email } = req.body;
            // Kiểm tra xem người dùng đã tồn tại trong cơ sở dữ liệu chưa
            const userExists = await User.exists({ username: email });
            if (!userExists) {
                return res.status(409).json({ error: 'Người dùng không tồn tại' });
            }
            if (!userExists.active) {
                return res.status(403).json({
                    error: errorMessages.deactivatedUser,
                });
            }
            // Gửi mã OTP qua email
            const otpResult = await mailer.sendOTP(email);
            if (otpResult.error) {
                console.error(otpResult.error);
                return res.status(500).json({ error: 'Đã xảy ra lỗi khi gửi OTP' });
            }

            // Lưu mã OTP vào cơ sở dữ liệu
            await OTP.create({ email, otp: otpResult.otp });

            return res.json({
                success: true,
                message: 'Mã OTP đã được gửi đến email của bạn',
                expiresAfterSeconds: otpExpiredSeconds,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: errorMessages.internalServerError,
            });
        }
    };

    // [POST] /authenticate
    authenticate = async (req, res) => {
        try {
            const username = req.body.username;
            const check = await User.findOne({ username }).select('+password');

            // Kiểm tra tồn tại user
            if (!check) {
                return res.status(404).json({
                    error: errorMessages.userNotFound,
                });
            }

            // Kiểm tra tài khoản còn hoạt động hay không
            if (!check.active) {
                return res.status(403).json({
                    error: errorMessages.deactivatedUser,
                });
            }

            // Đối chiếu mật khẩu
            const isPasswordMatched = await bcrypt.compare(req.body.password, check.password);

            if (isPasswordMatched) {
                const { username, studentId, name, role, active } = check.toObject();
                //Tạo Token cho user
                const token = generateToken({ username, role });
                return res.json({
                    success: true,
                    token,
                    user: { username, studentId, name, role, active },
                });
            } else {
                return res.status(401).json({
                    error: errorMessages.wrongPassword,
                });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: errorMessages.internalServerError,
            });
        }
    };
}
module.exports = new AuthenticateController();
