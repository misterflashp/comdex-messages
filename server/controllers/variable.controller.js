let async = require('async');
let variableDbo = require('../dbos/variable.dbo');
let logsDbo = require('../dbos/logs.dbo');
let jwt = require('../helpers/JWT');
let updateVariable = (req, res) => {
    let {
        name,
        value,
        appCode
    } = req.body;
    let {
        token
    } = req.headers;
    let user, oldValue;
    let updatedOn = Date.now();
    async.waterfall([
        (next) => {
            jwt.verifyJWT(token, (error, data) => {
                if (error) next({
                    status: 400,
                    message: "Token expired"
                }, null);
                else {
                    user = data.username;
                    next(null);
                }
            });
        }, (next) => {
            variableDbo.getVariable({
                appCode,
                name
            }, (error, result) => {
                if (error) {
                    next({
                        status: 500,
                        message: "Error while updating variable"
                    }, null);
                } else if (result && result.length) {
                    oldValue = result[0].value;
                    next(null);
                } else {
                    next({
                        status: 400,
                        message: "No variable exists"
                    }, null);
                }
            })
        }, (next) => {
            variableDbo.updateVariable({
                name,
                value,
                appCode,
                updatedOn
            }, (error, result) => {
                if (error) next({
                    status: 500,
                    message: '  Error while updating variable information'
                }, null);
                else {
                    next(null);
                }
            });
        }, (next) => {
            logObj = {
                user: user,
                logType: "variable",
                appCode: appCode,
                name: name,
                newValue: value,
                oldValue: oldValue,
                updatedOn: updatedOn
            }
            logsDbo.logRequest(logObj, (error, result) => {
                if (error) {
                    next({
                        status: 500,
                        message: "Error while logging"
                    }, null);
                } else {
                    next(null, {
                        status: 200,
                        message: "Variable updated successfully"
                    });
                }
            })
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

let getVariable = (req, res) => {
    let {
        name,
        appCode
    } = req.query;
    let obj = {};
    if (name) obj.name = name;
    if (appCode) obj.appCode = appCode;
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
            variableDbo.getVariable(obj, (error, result) => {
                if (error) next({
                    status: 500,
                    message: 'Error while fetching variable'
                }, null);
                else next(null, {
                    status: 200,
                    info: result
                });
            });
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

let addVariable = (req, res) => {
    let {
        name,
        value,
        appCode
    } = req.body;
    let updatedOn = Date.now();
    let {
        token
    } = req.headers;
    let user;
    async.waterfall([
        (next) => {
            jwt.verifyJWT(token, (error, data) => {
                if (error) next({
                    status: 400,
                    message: "Token expired"
                }, null);
                else {
                    user = data.username;
                    next(null);
                }
            });
        }, (next) => {
            variableDbo.getVariable({
                appCode,
                name
            }, (error, result) => {
                if (error) {
                    next({
                        status: 500,
                        message: "Error while updating variable"
                    }, null);
                } else if (result && result.length) {
                    next({
                        status: 400,
                        message: "Variable already exists"
                    }, null);
                } else {
                    next(null);
                }
            });
        }, (next) => {
            variableDbo.updateVariable({
                name,
                value,
                appCode,
                updatedOn
            }, (error, result) => {
                if (error) next({
                    status: 500,
                    message: '  Error while saving variable information'
                }, null);
                else {
                    next(null);
                }
            });
        }, (next) => {
            logObj = {
                user: user,
                logType: "variable",
                appCode: appCode,
                name: name,
                newValue: value,
                oldValue: {},
                updatedOn: updatedOn
            }
            logsDbo.logRequest(logObj, (error, result) => {
                if (error) {
                    next({
                        status: 500,
                        message: "Error while logging"
                    }, null);
                } else {
                    next(null, {
                        status: 200,
                        message: "Variable added successfully"
                    });
                }
            })

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
    updateVariable,
    getVariable,
    addVariable
};