let mongoose = require('mongoose');

let jwtSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    createdOn: {
        type: Date,
        required:true
    },
    expiresOn: {
        type: Date,
        required: true
    }
}, {
        versionKey: false,
        strict: true
    });

module.exports = mongoose.model('jwt', jwtSchema);