const express = require('express');
const mongoose = require('mongoose');
const joi = require('joi');
const validate = require('express-validation');
const tokenizer = require('../helpers/jwt-tokenizer');
const hasher = require('../helpers/hash-me');
const bcrypt = require('bcrypt');

const router = express.Router();
const projectsRouter = require('./projects-router');
const notifyRouter = require('./notify-router');

const newFacultyValidator = {
    body: {
        name: joi.string().required(),
        aid: joi.string().required(),
        email: joi.string().email().required(),
        branch: joi.string().required(),
        password: joi.string().regex(/[a-zA-Z0-9]{3,30}/).required()
    }
}
const facultyLoginValidator = {
    body: {
        aid: joi.string().required(),
        password: joi.string().regex(/[a-zA-Z0-9]{3,30}/).required()
    }
}
const Faculty = mongoose.model('Faculty');
router.post('/signup', validate(newFacultyValidator), async (req, res) => {
    const { name, aid, branch, email, password } = req.body;
    const facultyParams = { name, aid, branch, email, password };
    try {
        const hash = await hasher(password);
        // const student = new Student
        const faculty = new Faculty({
            ...facultyParams,
            password: hash,
            joinDate: new Date()
        })
        const obj = await faculty.save();
        const token = await tokenizer({ aid, _id: obj._id, category: 'Faculty' })
        res.send({
            id: obj._id,
            success: true,
            token
        });
    } catch (e) {
        if (e.code === 11000) {
            res.send({
                error: true,
                message: 'AID duplication'
            })
        }
        res.send({
            error: true,
            message: e
        })
    }
})

router.post('/login', validate(facultyLoginValidator), async (req, res) => {
    const { aid, password } = req.body;
    try {
        const faculty = await Faculty.findOne({ aid });
        if (faculty) {
            const hash = await bcrypt.compare(password, faculty.password);
            if (hash) {
                const { sem, email, section, name, _id } = faculty;
                const token = await tokenizer({ aid, _id, category: 'Faculty', })
                res.send({
                    success: true,
                    id: _id,
                    token
                })
            }
            else {
                res.send({
                    error: 1,
                    message: "Invalid AID or password"
                })
            }
        }
        else {
            res.send({
                error: 1,
                message: 'AID unregistered'
            })
        }
    } catch (e) {

    }
})

router.use('/projects', projectsRouter);
router.use('/notify', notifyRouter);


module.exports = router;