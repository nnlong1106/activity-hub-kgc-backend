const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Student = require('./Student');

const studentClassSchema = new Schema({
    classId: { type: String, uppercase: true, trim: true },
    faculty: String,
    major: String,
    group: Number,
    system: String,
    course: Number,
    shortName: String,
    fullName: String,
    startYear: Number,
    endYear: Number,
    countStudents: Number,
    students: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
        default: [],
    },
});

studentClassSchema.index({ endYear: -1, classId: 1 });

studentClassSchema.pre('save', async function (next) {
    const studentClass = this;
    try {
        // Đếm số lượng sinh viên trong lớp
        studentClass.countStudents = studentClass.students.length;
        // Tạo tên cho lớp
        const { major, group, system, course } = studentClass;
        let fullName, shortName;
        if (!group || group === 0) {
            fullName = `${major}`;
        } else {
            fullName = `${major} ${group}`;
        }
        let arr = fullName.toUpperCase().split(' ');
        shortName = arr.reduce((shortName, curWord) => {
            if (curWord.toUpperCase() === 'và'.toUpperCase()) {
                curWord = '-';
            }
            return shortName + curWord[0];
        }, '');
        studentClass.fullName = `${fullName} - ${system}K${course}`;
        studentClass.shortName = `${shortName}_${system}K${course}`;
        next();
    } catch (error) {
        return next(error);
    }
});
const StudentClass = mongoose.model('StudentClass', studentClassSchema);
module.exports = StudentClass;
