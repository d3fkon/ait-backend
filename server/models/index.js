const mongoose = require('mongoose');
module.exports = () => {
    console.log('vola')
    mongoose.model('Student', require('./student-model'));
    mongoose.model('Project', require('./project-model'));
    mongoose.model('Faculty', require('./faculty-model'))

    console.log('models created: ', mongoose.modelNames())
}