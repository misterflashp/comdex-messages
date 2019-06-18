let async = require('async');
let messageDbo = require('../dbos/message.dbo');
let logsDbo = require('../dbos/logs.dbo');
let jwt = require('../helpers/JWT');
let lodash = require('lodash');
var xmlFile = '/tmp/data.xml';
var jsonFile = '/tmp/data.json';
let fs = require('fs');
/**
 * @api {post/put} /message To update or add message.
 * @apiName updateMessage
 * @apiGroup Message
 * @apiParam {Object} message Message to be updated.
 * @apiParam {String} appCode Type of app.
 * @apiParam {String} name Message name.
 * @apiError ErrorWhileUpdatingMessage Error while updating the message.
 * @apiErrorExample ErrorWhileUpdatingMessage-Response:
 * {
 *   success: false,
 *   message: 'Error while updating message'
 * }
 *@apiSuccessExample Response :
 * {
 *   success: true,
 *   message: "Updated successfully"
 * }
 */
let updateMessage = (req, res) => {
    let {
        token
    } = req.headers;
    let {
        message,
        name,
        appCode,
        reference
    } = req.body;
    let updatedOn = Date.now();
    let oldValue = {};
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
            messageDbo.getMessages({
                name,
                appCode
            }, (error, message) => {
                if (error) {
                    next({
                        status: 500,
                        message: 'Error while getting message'
                    }, null);
                } else if (message && message.length) {
                    oldValue = message[0]['message'];
                    next(null);
                } else {
                    next({
                        status: 400,
                        message: 'No message exists with that name'
                    }, null);
                }
            })
        }, (next) => {
            messageDbo.updateMessage({
                    message,
                    appCode,
                    name,
                    updatedOn,
                    reference
                },
                (error, result) => {
                    if (error) {
                        next({
                            status: 500,
                            message: 'Error while updating message'
                        }, null);
                    } else next(null);
                });
        }, (next) => {
            let logObj = {
                user: user,
                appCode: appCode,
                logType: "message",
                name: name,
                oldValue: oldValue,
                newValue: message,
                updatedOn: updatedOn
            };
            logsDbo.logRequest(logObj, (error, response) => {
                if (error) {
                    next({
                        status: 500,
                        message: "Error while logging"
                    }, null);
                } else {
                    next(null, {
                        status: 200,
                        message: "Message updated successfully"
                    });
                }
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
};

let addMessage = (req, res) => {
    let {
        token
    } = req.headers;
    let {
        message,
        name,
        appCode,
        reference
    } = req.body;
    let updatedOn = Date.now();
    let oldValue = {};
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
            messageDbo.getMessages({
                name,
                appCode
            }, (error, message) => {
                if (error) {
                    next({
                        status: 500,
                        message: 'Error while getting message'
                    }, null);
                } else if (message && message.length) {
                    next({
                        status: 400,
                        message: 'Already message exists with that name'
                    }, null);
                } else {
                    next(null);
                }
            })
        }, (next) => {
            messageDbo.updateMessage({
                    message,
                    appCode,
                    name,
                    updatedOn,
                    reference
                },
                (error, result) => {
                    if (error) {
                        next({
                            status: 500,
                            message: 'Error while adding message'
                        }, null);
                    } else next(null);
                });
        }, (next) => {
            let logObj = {
                user: user,
                appCode: appCode,
                logType: "message",
                name: name,
                oldValue: oldValue,
                newValue: message,
                updatedOn: updatedOn
            };
            logsDbo.logRequest(logObj, (error, response) => {
                if (error) {
                    next({
                        status: 500,
                        message: "Error while logging"
                    }, null);
                } else {
                    next(null, {
                        status: 200,
                        message: "Message added successfully"
                    });
                }
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
};

/**
 * @api {get} /message To get all available messages.
 * @apiName getMessage
 * @apiGroup Message
 * @apiParam {String} appCode Type of app.
 * @apiError ErrorWhileFetchingMessage Error while fetching the messages.
 * @apiErrorExample ErrorWhileFetchingMessage-Response:
 * {
 *   success: false,
 *   message: 'Error while fetching message'
 * }
 *@apiSuccessExample Response :
 * {
 *   success: true,
 *   list: List of all available messages with updated dates.
 * }
 */
let getMessage = (req, res) => {
    let {
        appCode,
        sortBy,
        order
    } = req.query;
    let {
        token
    } = req.headers;
    sortBy = (sortBy) ? ((sortBy === "name") ? sortBy : "message." + sortBy) : "name";
    let ord = (order) ? ((order === 'desc') ? -1 : 1) : 1;
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
            messageDbo.getMessage({
                appCode,
                sortBy,
                ord
            }, (error, result) => {
                if (error) {
                    next({
                        status: 500,
                        message: 'Error while fetching message'
                    }, null);
                } else next(null, {
                    status: 200,
                    messages: result
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
};

let searchMessage = (req, res) => {
    let {
        searchKey,
        appCode
    } = req.query;
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
            messageDbo.searchMessage({
                    searchKey,
                    appCode
                },
                (error, result) => {
                    if (error) next({
                        status: 500,
                        message: 'Error while searching '
                    }, null);
                    else next(null, {
                        status: 200,
                        info: result
                    });
                });
        }
    ], (error, success) => {
        let response = Object.assign({
            success: !error
        }, error || success);
        let status = response.status;
        delete (response.status);
        res.status(status).send(response);
    });
};

let getMessageFileDown = (req, res) => {
    let {
        appCode,
        languages,
        format
    } = req.query;
    let availableLang = [];
    let notAvailableLang = [];
    if (!format) format = "xml";
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
            messageDbo.getMessages({
                appCode
            }, (error, result) => {
                if (error) {
                    next({
                        status: 500,
                        message: 'Error while fetching message'
                    }, null);
                } else if (result && result.length) {
                    if (format && format == "xml") {
                        let allLang = [];
                        lodash.forEach(result, (res) => {
                            let lang = Object.keys(res.message);
                            allLang = allLang.concat(lang);
                        });
                        allLang = lodash.uniq(allLang);

                        let msg = result[0].message;
                        fs.writeFile(xmlFile, '');
                        let resource = `<resources>\n`;
                        fs.appendFileSync(xmlFile, resource);
                        lodash.forEach(languages, (language) => {
                            if (allLang.indexOf(language) > -1) {
                                resource = `<lang  name = \"${language}\"> \n`;
                                fs.appendFileSync(xmlFile, resource);
                                lodash.forEach(result, (obj) => {
                                    let string = "\t<string name = \"" + obj.name + "\"> " + obj.message[language] + "</string>\n";
                                    if (obj.message[language]) fs.appendFileSync(xmlFile, string);
                                });
                                let resourceend = "</lang>\n";
                                fs.appendFileSync(xmlFile, resourceend);
                                availableLang.push(language);
                            } else {
                                notAvailableLang.push(language);
                            }
                        });
                        let resourceend = "</resources>";
                        fs.appendFileSync(xmlFile, resourceend);
                        next(null);
                    } else if (format && format == "json") {
                        fs.writeFileSync(jsonFile, '');
                        let finalObj = {};
                        lodash.forEach(languages, (language) => {
                            let obj = {};
                            lodash.forEach(result, (message) => {
                                let msg = message.message;
                                if (msg[language]) obj[message.name] = msg[language];
                            });
                            if ((Object.keys(obj)).length) {
                                finalObj[language] = obj;
                                availableLang.push(language);
                            } else {
                                notAvailableLang.push(language);
                            }
                        });
                        fs.writeFileSync(jsonFile, JSON.stringify(finalObj), 'utf-8');
                        next(null);
                    } else {
                        next({
                            status: 400,
                            message: "Required format not available"
                        }, null);
                    }

                } else {
                    next({
                        status: 400,
                        message: ' No records found'
                    }, null);
                }
            });
        }, (next) => {
            if (availableLang.length == languages.length) {
                next(null, {
                    status: 200,
                    format: format,
                    message: 'All languages available'
                });
            } else if (notAvailableLang.length == languages.length) {
                next({
                    status: 400,
                    format: format,
                    message: 'No language transalation available'
                });
            } else {
                next(null, {
                    status: 300,
                    format: format,
                    message: 'Some language translation available'
                });
            }
        }
    ], (error, result) => {
        let response = Object.assign({
            success: !error
        }, error || result);
        let status = response.status;
        delete (response.status);
        let format = response.format;
        let file;
        if (format == "json") file = jsonFile;
        if (format == "xml") file = xmlFile;
        delete response.format;
        if (status == 200) {
            res.status(status).download(file, `${appCode}_All_Languages_Messages.${format}`);
        } else if (status == 300) {
            res.status(200).download(file, `${appCode}_Some_Languages_Messages.${format}`);
        } else {
            res.status(status).send(response);
        }
    });
};

module.exports = {
    getMessage,
    updateMessage,
    searchMessage,
    getMessageFileDown,
    addMessage
};