let VariableModel = require('../models/variable.model');

let getVariable = (object, cb) => {
    VariableModel.find(object, {
        _id: 0
    }, (error, result) => {
        if (error) cb(error, null);
        else cb(null, result || []);
    });
}

let updateVariable = (object, cb) => {
    let {
        name,
        appCode
    } = object;
    VariableModel.updateOne({
        appCode,
        name
    }, {
        $set: object
    }, {
        upsert: true
    }, (error, result) => {
        if (error) cb(error, null);
        else cb(null, result);
    })
}

module.exports = {
    getVariable,
    updateVariable
};