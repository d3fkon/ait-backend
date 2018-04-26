const express = require('express');
const mongoose = require('mongoose');
const joi = require('joi');
const validate = require('express-validation');
const tokenizer = require('../helpers/jwt-tokenizer');
const hasher = require('../helpers/hash-me');
const bcrypt = require('bcrypt');

const router = express.Router();
const projectsRouter = require('./projects-router');

const newStudentValidator = {
    body: {
        name: joi.string().required(),
        usn: joi.string().regex(/^1AY[1-9]{2}[A-Z]{2}\d{3}/i).required(),
        email: joi.string().email().required(),
        sem: joi.number().required(),
        section: joi.string().required(),
        password: joi.string().regex(/[a-zA-Z0-9]{3,30}/).required()
    }
}
const studentLoginValidator = {
    body: {
        usn: joi.string().regex(/^1AY[1-9]{2}[A-Z]{2}\d{3}/i).required(),
        password: joi.string().regex(/[a-zA-Z0-9]{3,30}/).required()
    }
}
const Student = mongoose.model('Student');
router.post('/signup', validate(newStudentValidator), async (req, res) => {
    const { name, usn, branch, sem, email, section, password } = req.body;
    const studentParams = { name, usn, branch, sem, email, section };
    try {
        const hash = await hasher(password);
        // const student = new Student
        const student = new Student({
            ...studentParams,
            usn: usn.match(/^1AY[1-9]{2}[A-Z]{2}\d{3}/i)[0],
            password: hash,
            joinDate: new Date()
        })
        const obj = await student.save();
        const token = await tokenizer({ usn, _id: obj._id, category: 'Student' })
        res.send({
            id: obj._id,
            success: true,
            token
        });
    } catch (e) {
        if (e.code === 11000) {
            return res.send({
                error: true,
                message: 'USN duplication'
            })
        }
        res.send({
            error: true,
            message: e
        })
    }
})
router.post('/login', validate(studentLoginValidator), async (req, res) => {
    const { usn, password } = req.body;
    try {
        const student = await Student.findOne({ usn });
        if (student) {
            const hash = await bcrypt.compare(password, student.password);
            if (hash) {
                const { sem, email, section, name, _id } = student;
                const token = await tokenizer({ usn, _id, category: 'Student' })
                res.send({
                    success: true,
                    id: _id,
                    token
                })
            }
            else {
                res.send({
                    error: 1,
                    message: "Invalid USN or password"
                })
            }
        }
        else {
            res.send({
                error: 1,
                message: 'USN unregistered'
            })
        }
    } catch (e) {

    }
})
router.use('/projects', projectsRouter);

module.exports = router;

