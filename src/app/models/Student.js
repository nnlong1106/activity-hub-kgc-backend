const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
    studentId: { type: String, uppercase: true, trim: true },
    fullName: String,
    firstName: String,
    lastName: String,
    memberOf: [{ type: String }],
    isStillStudying: { type: Boolean, default: true },
    gender: { type: String, default: 'Nữ' },
    dateOfBirth: { type: Date, default: Date.now() },
    _classId: { type: Schema.Types.ObjectId, ref: 'StudentClass', require: true },
});

studentSchema.index({ _classId: 1, studentId: 1 });

studentSchema.pre('save', async function (next) {
    const student = this;

    try {
        student.fullName = student.lastName + ' ' + student.firstName;
        student.studentId = student.studentId.trim().toUpperCase();
        next();
    } catch (error) {
        return next(error);
    }
});

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
