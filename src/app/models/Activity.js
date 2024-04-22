const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const activitySchema = new Schema({
    title: { type: String, required: true },
    date: { type: Date, default: Date.now() },
    semester: { type: Number, required: true },
    year: { type: String, required: true },
    organization: { type: String, required: true },
    description: { type: String, default: '' },
    participations: {
        type: [
            {
                student: { type: Schema.Types.ObjectId, ref: 'Student' },
                point: Number,
                note: String,
            },
        ],
        default: [],
    },
    approved: { type: Boolean, default: false },
});

activitySchema.index({ year: -1, date: 1 });

const Activity = mongoose.model('Activity', activitySchema);
module.exports = Activity;
