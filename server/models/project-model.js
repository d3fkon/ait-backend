const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    owner: {
        category: String,
        details: {
            type: Schema.Types.ObjectId,
            refPath: 'owner.category',
            required: true
        }
    },
    desc: {
        type: String,
        required: true
    },
    ongoing: {
        type: Boolean,
        required: true
    },
    beginDate: {
        type: Date,
        required: true,
        default: Date.now()
    },
    finishDate: {
        type: Boolean,
    },
    seenBy: [String]
});

module.exports = ProjectSchema