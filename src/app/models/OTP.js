const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const otpExpiredSeconds = parseInt(process.env.OTP_EXPIRED_SECONDS) || 120;

const OTPSchema = new Schema(
    {
        email: { type: String, required: true },
        otp: { type: String, required: true },
        password: { type: String },
        studentId: { type: String },
    },
    { timestamps: true },
);

OTPSchema.index({ createdAt: 1 }, { expires: otpExpiredSeconds });

const OTP = mongoose.model('OTP', OTPSchema);

module.exports = OTP;
