let joi = require('joi');

let getLogs = (req, res, next) => {
    let getLogsSchema = joi.object().keys({
        startDate: joi.date(),
        user: joi.string(),
        logType: joi.string().required(),
        name: joi.string(),
        appCode: joi.string().required(),
        language: joi.string()
    });
    let {error} = joi.validate(req.query, getLogsSchema);
    if (error) res.status(422).send({
        success: false,
        error
    });
    else next();
};

module.exports = {
    getLogs
};