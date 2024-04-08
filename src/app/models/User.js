const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Student = require('./Student');
const bcrypt = require('bcrypt');
const salts = parseInt(process.env.SALTS);
const roles = JSON.parse(process.env.ROLES);
const [viewer] = roles;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    studentId: {
        type: String,
        default: null,
    },
    name: {
        type: String,
    },
    role: {
        type: String,
        enum: roles,
        default: viewer,
        required: true,
    },
    active: {
        type: Boolean,
        required: true,
        default: true,
    },
});

userSchema.pre('save', async function (next) {
    try {
        const user = this;

        if (user.studentId) {
            const student = await Student.findOne({ studentId: user.studentId });

            if (!student) {
                return next(new Error('Student not found'));
            }

            user.name = student.fullName;
        }

        return next();
    } catch (error) {
        return next(error);
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
