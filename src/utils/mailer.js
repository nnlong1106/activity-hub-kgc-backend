const nodemailer = require('nodemailer');
const rootEmail = JSON.parse(process.env.EMAIL);
const generateOTP = require('./generateOTP');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: rootEmail.username,
        pass: rootEmail.password,
    },
});

const sendOTP = async (toEmail) => {
    // Tạo mã OTP
    const otp = generateOTP();
    const mailOptions = {
        from: rootEmail.username,
        to: toEmail,
        subject: 'Mã OTP - Activity Hub KGC',
        text: `Mã OTP của bạn là: ${otp}`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return { otp };
    } catch (error) {
        return { error };
    }
};

module.exports = {
    sendOTP,
};
