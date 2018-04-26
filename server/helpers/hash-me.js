const bcrypt = require('bcrypt')

module.exports = payload => new Promise((res, rej) => {
    bcrypt.hash(payload, 10, (err, hash) => {
        if (err) rej(err)
        else res(hash)
    })
})