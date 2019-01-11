let userModel = require('../models/user.model');

let login = (obj, cb) => {
  userModel.find(obj, {}, (error, result) => {
    if (error) cb(error, null);
    else cb(null, result || []);
  })
}
let getUserDetails = (obj, cb)=>{
  userModel.find(obj, {}, (error, result) => {
    if (error) cb(error, null);
    else cb(null, result || []);
  })
}

let signUp = (obj, cb) => {
  let object = new userModel(obj);
  object.save((error, result) => {
    if (error) cb(error, null);
    else cb(null, result || []);
  })
}

module.exports = {
  login,
  signUp,
  getUserDetails
};
