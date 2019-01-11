let joi = require('joi');

let getMessage = (req, res, next) => {
  let updateMessageSchema = joi.object().keys({
    appCode: joi.string().required(),
    sortBy: joi.string(),
    order: joi.string()
  });
  let {
    error
  } = joi.validate(req.query, updateMessageSchema);
  if (error) res.status(422).send({
    success: false,
    error
  });
  else next();
};

let searchMessage = (req, res, next) => {
  let searchMessageSchema = joi.object().keys({
    searchKey: joi.string().required(),
    appCode: joi.string().required()
  });
  let {
    error
  } = joi.validate(req.query, searchMessageSchema);
  if (error) res.status(422).send({
    success: false,
    error
  });
  else next();
};


let updateMessage = (req, res, next) => {
  let updateMessageSchema = joi.object().keys({
    message: joi.object().required(),
    name: joi.string().required(),
    appCode: joi.string().required()
  });
  let {
    error
  } = joi.validate(req.body, updateMessageSchema);
  // console.log(req.body);
  if (error) res.status(422).send({
    success: false,
    error
  });
  else next();
};
let getMessageFile = (req, res, next) => {
  let getMessageFileSchema = joi.object().keys({
    appCode: joi.string().required()
  });
  let {
    error
  } = joi.validate(req.query, getMessageFileSchema);
  if (error) res.status(422).send({
    success: false,
    error
  });
  else next();
};
let getMessageFileDown = (req, res, next) => {
  let getMessageFileSchema = joi.object().keys({
    appCode: joi.string().required(),
    languages: joi.array().required(),
    format: joi.string()
  });
  let {
    error
  } = joi.validate(req.query, getMessageFileSchema);
  if (error) res.status(422).send({
    success: false,
    error
  });
  else next();
};

module.exports = {
  updateMessage,
  getMessage,
  searchMessage,
  getMessageFile,
  getMessageFileDown
};