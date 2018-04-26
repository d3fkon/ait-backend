const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const validate = require('express-validation');


mongoose.connect('mongodb://localhost/deptapp')
const app = express();
const db = mongoose.connection;
// Create Collections
require('./server/models/index')();

/**
 *   import routers after creating models ^^^
 */
const studentRouter = require('./server/routes/student-router');
const facultyRouter = require('./server/routes/faculty-router');
const addProjectRouter = require('./server/routes/projects-router');
/**
 * 
 */
const Student = mongoose.model('Student')
const Faculty = mongoose.model('Faculty')

db.once('open', () => {
    console.log('db connected')
    // db.dropDatabase();
})


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/student', studentRouter);
app.use('/faculty', facultyRouter);
app.get('/', async (req, res) => {
    res.send({
        faculty: await Faculty.find({}),
        student: await Student.find({}).populate('notifications.sender', 'name')
    })
})
/*
test tokens here

*/
// error handler 
app.use(function (err, req, res, next) {
    // specific for validation errors 
    if (err instanceof validate.ValidationError) return res.status(err.status).json(err);

    // other type of errors, it *might* also be a Runtime Error 
    // example handling 
    if (process.env.NODE_ENV !== 'production') {
        return res.status(500).send(err.stack);
    } else {
        return res.status(500);
    }
});

app.listen(8080, () => {
    console.log('listening on port 8080')
})