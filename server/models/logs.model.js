let mongoose = require('mongoose');

let logSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    oldValue: {
        type: Object,
        required: true
    },
    newValue: {
        type: Object,
        required: true
    },
    appCode: {
        type: String,
        required: true
    },
    logType: {
        type: String,
        required: true
    },
    updatedOn: {
        type: Date,
        required: true
    }
}, {
    versionKey: false,
    strict: true
});

module.exports = mongoose.model('log', logSchema);
