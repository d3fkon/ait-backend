const jwt = require('jsonwebtoken');
const { jwtSecret } = require('./config');

module.exports = payload => new Promise((res, rej) => {
    jwt.sign(payload, jwtSecret, (err, token) => {
        if (err) rej(err);
        else res(token)
    })
})