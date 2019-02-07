let async = require('async');
let logsDbo = require('../dbos/logs.dbo');
let lodash = require('lodash');
let jwt = require('../helpers/JWT');
let getLogs = (req, res) => {
    let {
        startDate,
        user,
        name,
        appCode,
        language,
        logType
    } = req.query;
    let logs = [];
    let date = new Date(new Date() - (7 * 24 * 60 * 60 * 1000));
    if (!startDate) startDate = date;
    let {
        token
    } = req.headers;
    async.waterfall([
        (next) => {
            jwt.verifyJWT(token, (error, data) => {
                if (error) next({
                    status: 400,
                    message: "Token expired"
                }, null);
                else {
                    next(null);
                }
            });
        }, (next) => {
            let obj = {};
            if (user) obj['user'] = user;
            if (name) obj['name'] = name;
            if (appCode) obj['appCode'] = appCode;
            obj['updatedOn'] = {
                '$gt': startDate
            };
            if (logType) obj['logType'] = logType;
            logsDbo.getLogs(obj, (error, result) => {
                if (error) {
                    next({
                        status: 500,
                        message: "Error while getting logs"
                    }, null);
                } else if (result && result.length) {
                    next(null, result);
                } else {
                    next({
                        status: 400,
                        message: "No logs found"
                    }, null);
                }
            })
        }, (result, next) => {
            if (language) {
                lodash.forEach(result, (log) => {
                    let oldV = (log.oldValue) ? log.oldValue : null;
                    let newV = log.newValue;
                    if (oldV && (oldV[language] === newV[language])) {
                    } else if (newV[language]) logs.push(log);
                    else {
                    }
                });
                if (logs && logs.length) {
                    next(null, {
                        status: 200,
                        logs: logs
                    });
                } else {
                    next({
                        status: 400,
                        message: "No logs found"
                    }, null);
                }
            } else {
                next(null, {
                    status: 200,
                    logs: result
                });
            }
        }
    ], (error, result) => {
        let response = Object.assign({
            success: !error
        }, error || result);
        let status = response.status;
        delete (response.status);
        res.status(status).send(response);
    });
}

module.exports = {
    getLogs
};