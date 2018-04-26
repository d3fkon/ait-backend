const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FacultySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    aid: {
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
    notifications: [{
        level: Number,
        topic: String,
        message: String,
        branch: String,
        sem: Number,
        section: String
    }]
})

module.exports = FacultySchema