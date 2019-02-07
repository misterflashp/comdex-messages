let jwtModel = require('../models/jwt.model');

let getJwt = (obj, cb) =>{
    jwtModel.find(obj, {}, (error, result) => {
        if (error) cb(error, null);
        cb(null, result || null);
    });
}

let deleteJwt = (obj, cb) => {
    jwtModel.findOneAndDelete(obj, {}, (error, result) => {
        if (error) cb(error, null);
        cb(null, result || null);
    });
}

let addAdd = (obj, cb) => {
    let jwt = new jwtModel(obj)
    jwt.save((error, result) => {
        if (error) cb(error, null);
        else cb(null, result || []);
    });
}

module.exports = {
   getJwt,
   addAdd,
   deleteJwt
};