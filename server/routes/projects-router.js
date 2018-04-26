const express = require('express');
const mongoose = require('mongoose');
const joi = require('joi');
const validate = require('express-validation');
const jwt = require('express-jwt');
const { jwtSecret } = require('../helpers/config');

const router = express.Router();

const projectValidator = {
    body: {
        name: joi.string().required(),
        desc: joi.string().required(),
        ongoing: joi.boolean().required(),
    }
}

const Project = mongoose.model('Project');
const Student = mongoose.model('Student');
const Faculty = mongoose.model('Faculty');

const players = {
    Student: mongoose.model('Student'),
    Faculty: mongoose.model('Faculty'),
}

router.get('/', async (req, res) => {
    try {
        res.send(await Project.find({}).populate('owner.details', 'name email'))
        // res.send(req.originalUrl.match(/([^\/]+)/)[0].split('').map((_, i) => i==0?_.toUpperCase(): _).join(''))
    }
    catch (e) {
        res.send(e)
    }
})

router.post('/new', jwt({ secret: jwtSecret }), validate(projectValidator), async (req, res) => {
    const { name, desc, ongoing } = req.body;
    if(req.originalUrl.match(/([^\/]+)/)[0].split('').map((_, i) => i==0?_.toUpperCase(): _).join('') !== req.user.category) {
        res.send({
            error: true,
            message: 'invalid api'
        });
        return;
    }
    const project = new Project({
        name, desc, ongoing,
        owner: {
            category: req.user.category,
            details: req.user._id
        },
        beginDate: new Date(),
    })
    try {
        const obj = await project.save();
        const update = await players[req.user.category].findByIdAndUpdate(req.user._id, {
            '$push': {
                projects: obj._id
            }
        })
        res.send({
            success: 1,
            update
        })
    } catch (e) {
        res.send({
            error: 1,
            ...e
        })
    }
})

router.put('/edit', jwt({ secret: jwtSecret }), validate({ ...projectValidator, projectId: joi.string().required() }), async (req, res) => {
    const { name, desc, ongoing, projectId } = req.body;
    try {
        const project = await Project.findByIdAndUpdate(projectId, { name, desc, ongoing });
        if (project) {
            res.send({
                success: true,
                updated: 1
            })
        }
        else {
            res.send({
                error: true,
                message: 'failed to find project with that ID'
            })
        }

    } catch (e) {
        res.send({
            error: true,
            ...e
        })
    }
})

router.delete('/delete', jwt({ secret: jwtSecret }), validate({ projectId: joi.string().required() }), async (req, res) => {
    const { projectId } = req.body;
    try {
        const { projectId } = req.body;
        const project = await Project.findByIdAndRemove(projectId)
        res.send({
            project,
            projectId
        });
    }
    catch (e) {
        res.send({
            error: true,
            ...e
        })
    }
})


module.exports = router;