let logModel = require('../models/logs.model');

let logRequest = (obj, cb) => {
    let object = new logModel(obj);
    object.save((error, result) => {
        if (error) cb(error, null);
        else cb(null, result || []);
    })
}

let getLogs = (obj, cb) => {
    logModel.find(obj, {
        '_id': 0
    }, (error, result) => {
        if (error) cb(error, null);
        cb(null, result || null);
    });
};
module.exports = {
    logRequest,
    getLogs
};