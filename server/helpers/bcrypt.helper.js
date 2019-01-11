let bcrypt = require('bcrypt');

let genHash = (obj, cb) => {
    let password = obj.password;
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            cb({
                status: 400,
                message: "Erro while hashing password"
            }, null);
        } else {
            cb(null, {
                hash: hash
            });
        }
    })
}

let verifyHash = (obj, cb) => {
    let {
        hash,
        password
    } = obj;
    let valid = bcrypt.compareSync(password, hash);
    if (valid) cb(null, {
        valid: valid
    });
    else cb({
        valid: valid
    }, null);
}
module.exports = {
    genHash,
    verifyHash
}