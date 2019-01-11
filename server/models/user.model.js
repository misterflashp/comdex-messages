let mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    createdOn: {
        type: Date,
        default: Date.now(),
        required: true
    }
}, {
        versionKey: false,
        strict: true
    });

module.exports = mongoose.model('user', userSchema);
