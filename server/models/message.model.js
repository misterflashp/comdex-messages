let mongoose = require('mongoose');

let messageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    message: {
        type: Object,
        required: true
    },
    appCode: {
        type: String,
        required: true
    },
    reference: {
        type: String,
        required: true,
        default: 'N/A'
    },
    updatedOn: {
        type: Date,
        required: true
    }
}, {
    versionKey: false,
    strict: true
});

module.exports = mongoose.model('message', messageSchema);