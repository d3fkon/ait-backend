const express = require('express');
const mongoose = require('mongoose');
const joi = require('joi');
const validate = require('express-validation');
const jwt = require('express-jwt');
const { jwtSecret } = require('../helpers/config');

const router = express.Router();

const players = {
    Student: mongoose.model('Student'),
    Faculty: mongoose.model('Faculty'),
}
/**
 * class => 0, check branch + sem + class
 * semester => 1 check branch + sem
 * department => 2 check branch
 * college => 3 update all
 */

const notifValidator = {
    body: {
        level: joi.number().required(),
        topic: joi.string().required(),
    }
}
/**
 * 
 *  notifications: [{
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
 * 
 * 
 */
const setUpdateSuccess = (obj, result) => {
    result.r = obj
    return obj.ok === 1
}

router.post('/', validate(notifValidator), jwt({ secret: jwtSecret }), async (req, res) => {
    if (req.user.category !== 'Faculty') {
        res.send({ error: 1, message: 'unauthorised' })
        return;
    }
    const { level } = req.body;
    const sender = req.user._id;
    let updatedStudent = false;
    let result = {}
    try {
        if (parseInt(level) === 0) { // CLASS LEVEL
            const { branch, sem, section, message, topic } = req.body;
            if (!branch || !sem || !section) return res.send({ error: true, message: 'invalid request' });
            const updateStudent = await players.Student.updateMany({ sem: parseInt(sem), section, branch }, {
                $push: { notifications: { level, topic, message, sender } }
            });
            updatedStudent = setUpdateSuccess(updateStudent, result);
        }
        else if (parseInt(level) === 1) { // SEMESTER LEVEL
            const { branch, sem, message, topic } = req.body;
            if (!branch || !sem) return res.send({ error: true, message: 'invalid request' });
            const updateStudent = await players.Student.updateMany({ sem: parseInt(sem), branch }, {
                $push: { notifications: { level, topic, message, sender } }
            });
            updatedStudent = setUpdateSuccess(updateStudent, result);
        }
        else if (parseInt(level) === 2) { // DEPARTMENT LEVEL
            const { branch, message, topic } = req.body;
            if (!branch) return res.send({ error: true, message: 'invalid request' });
            const updateStudent = await players.Student.updateMany({ branch }, {
                $push: { notifications: { level, topic, message, sender } }
            });
            updatedStudent = setUpdateSuccess(updateStudent, result);
        }
        else if (parseInt(level) === 3) { // ALL
            const updateStudent = await players.Student.updateMany({}, {
                $push: { notifications: { level, topic, message, sender } }
            });
            updatedStudent = setUpdateSuccess(updateStudent, result);
        }
        else {
            return res.send({
                error: true,
                message: 'invalid notification level'
            })
        }
        if (!updatedStudent) return res.send({ error: true, message: 'Update failed' })
        const { branch, sem, section, message, topic } = req.body;
        const updateFaculty = await players.Faculty.findByIdAndUpdate(req.user._id, {
            $push: {
                notifications: { level, branch, sem, section, message, topic, }
            }
        })
        res.send({
            success: true,
            ...result.r
        })
    } catch (e) {
        res.send({
            error: true,
            ...e
        })
    }
})

module.exports = router;