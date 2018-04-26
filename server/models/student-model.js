const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StudentSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    usn: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    sem: {
        type: Number,
        required: true,
    },
    section: {
        type: String,
        required: true
    },
    joinDate: {
        type: Date,
        required: true,
        default: new Date()
    },
    projects: [{
        type: Schema.Types.ObjectId,
        ref: 'Project'
    }],
    languageXp: [{
        name: String,
        level: Number
    }],
    volunteerXp: [{
        name: String,
        desc: String,
        beginDate: Date,
        finishDate: Date
    }],
    notifications: [{
        level: {
            type: Number,
            required: true
        },
        topic: String,
        message: String,
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'Faculty'
        }
    }]
})

module.exports = StudentSchema