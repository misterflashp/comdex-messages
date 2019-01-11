let async = require('async');
let messageDbo = require('../dbos/message.dbo');
let logsDbo = require('../dbos/logs.dbo');
let jwt = require('../helpers/JWT');
let lodash = require('lodash');
var file = '/tmp/data.xml';
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
    appCode
  } = req.body;
  let updatedOn = Date.now();
  let oldMessage = {};
  async.waterfall([
    (next) => {
      jwt.verifyJWT(token, (error, data) => {
        if (error) next({
          status: 400,
          message: "Token expired"
        }, null);
        else {
          next(null, data);
        }
      });
    }, (data, next) => {
      messageDbo.getOneMessage({
        name,
        appCode
      }, (error, message) => {
        if (error) {
          next({
            status: 500,
            message: 'Error while getting message'
          }, null);
        } else if (message && message.length) {
          oldMessage = message[0]['message'];
          next(null, data);
        } else {
          next({
            status: 400,
            message: 'No message exists with that name'
          }, null);
        }
      })
    }, (data, next) => {
      let logObj = {
        user: data.name,
        appCode: appCode,
        messageName: name,
        oldMessage: oldMessage,
        newMessage: message,
        updatedOn: updatedOn
      }
      logsDbo.logRequest(logObj, (error, response) => {
        if (error) {
          next({
            status: 500,
            message: "Error while logging"
          }, null);
        } else {
          next(null);
        }
      });
    },
    (next) => {
      messageDbo.updateMessage({
          message,
          appCode,
          name,
          updatedOn
        },
        (error, response) => {
          if (error) {
            next({
              status: 500,
              message: 'Error while updating message'
            }, null);
          } else next(null, {
            status: 200,
            message: 'Updated successfully'
          });
        });
    }
  ], (error, result) => {
    let response = Object.assign({
      success: !error
    }, error || result);
    let status = response.status;
    delete(response.status);
    res.status(status).send(response);
  });
}

let addMessage = (req, res) => {
  let {
    token
  } = req.headers;
  let {
    message,
    name,
    appCode
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
          updatedOn
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
      }
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
    delete(response.status);
    res.status(status).send(response);
  });
}

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
  sortBy = (sortBy) ? ((sortBy === "name") ? sortBy : "message." + sortBy) : "name";
  let ord = (order) ? ((order === 'desc') ? -1 : 1) : 1;
  async.waterfall([
    (next) => {
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
    delete(response.status);
    res.status(status).send(response);
  });
}
let searchMessage = (req, res) => {
  let {
    searchKey,
    appCode
  } = req.query;
  async.waterfall([
    (next) => {
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
    delete(response.status);
    res.status(status).send(response);
  });
}
/*
let getMessageFile = (req, res) => {
  let { appCode, languages } = req.query;
 // let isActive = true;
  // let language = languages[0];
  //console.log(languages);
  let availableLang = [];
  let notAvailableLang = [];
  fs.writeFile(file, '');
  async.waterfall([
    (next) => {
      appMessageDbo.getOneMessage({ appCode}, (error, result) => {
        if (error) {
          next({
            status: 500,
            message: 'Error while fetching message'
          }, null);
        } else if (result && result.length) {
          let msg = result[0].message;
          let resource = `<resources>\n`;
          fs.appendFileSync(file, resource);
          lodash.forEach(languages, (language) => {
            if (msg.hasOwnProperty(language)) {
              resource = `<lang  name = \"${language}\"> \n`;
              fs.appendFileSync(file, resource);
              lodash.forEach(result, (obj) => {
                let string = "\t<string name = \"" + obj.name + "\"> " + obj.message[language] + "</string>\n";
                fs.appendFileSync(file, string);
              });
              let resourceend = "</lang>\n";
              fs.appendFileSync(file, resourceend);
              availableLang.push(language);
            } else {
              notAvailableLang.push(language);
            }
          });
          let resourceend = "</resources>";
          fs.appendFileSync(file, resourceend);
          next(null);
        } else {
          next({
            status: 400,
            message: ' No records found'
          }, null);
        }
      });
    },(next)=>{
      if(availableLang.length == languages.length){
        next(null,{
          status:200,
          message:'All languages available'
        });
      }else if(notAvailableLang.length == languages.length){
        next({
          status: 400,
          message: 'No language transalation available'
        });
      }else{
        next(null,{
          status:300,
          message: 'Some language transalation available'
        });
      }
    }], (error, result) => {
      let response = Object.assign({
        success: !error
      }, error || result);
      let status = response.status;
      delete (response.status);
      if (status == 200) {
        res.status(status).download(file, `${appCode}_All_Languages_Messages.xml`);
      }else if (status == 300) {
        res.status(200).download(file, `${appCode}_Some_Languages_Messages.xml`);
      } else {
        res.status(status).send(response);
      }
    });
}
*/

let getMessageFileDown = (req, res) => {
  let {
    appCode,
    languages
  } = req.query;
  // let language = languages[0];
  //  console.log(languages);
  let availableLang = [];
  let notAvailableLang = [];
  fs.writeFile(file, '');
  async.waterfall([
    (next) => {
      messageDbo.getMessages({
        appCode
      }, (error, result) => {
        if (error) {
          next({
            status: 500,
            message: 'Error while fetching message'
          }, null);
        } else if (result && result.length) {
          let allLang = []
          lodash.forEach(result, (res) => {
            let lang = Object.keys(res.message);
            allLang = allLang.concat(lang);
          });
          allLang = lodash.uniq(allLang);

          let msg = result[0].message;
          let resource = `<resources>\n`;
          fs.appendFileSync(file, resource);
          lodash.forEach(languages, (language) => {
            if (allLang.indexOf(language) > -1) {
              resource = `<lang  name = \"${language}\"> \n`;
              fs.appendFileSync(file, resource);
              lodash.forEach(result, (obj) => {
                let string = "\t<string name = \"" + obj.name + "\"> " + obj.message[language] + "</string>\n";
                if (obj.message[language]) fs.appendFileSync(file, string);
              });
              let resourceend = "</lang>\n";
              fs.appendFileSync(file, resourceend);
              availableLang.push(language);
            } else {
              notAvailableLang.push(language);
            }
          });
          let resourceend = "</resources>";
          fs.appendFileSync(file, resourceend);
          next(null);
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
          message: 'All languages available'
        });
      } else if (notAvailableLang.length == languages.length) {
        next({
          status: 400,
          message: 'No language transalation available'
        });
      } else {
        next(null, {
          status: 300,
          message: 'Some language transalation available'
        });
      }
    }
  ], (error, result) => {
    let response = Object.assign({
      success: !error
    }, error || result);
    let status = response.status;
    delete(response.status);
    if (status == 200) {
      res.status(status).download(file, `${appCode}_All_Languages_Messages.xml`);
    } else if (status == 300) {
      res.status(200).download(file, `${appCode}_Some_Languages_Messages.xml`);
    } else {
      res.status(status).send(response);
    }
  });
}

module.exports = {
  getMessage,
  updateMessage,
  searchMessage,
  // getMessageFile,
  getMessageFileDown,
  addMessage
};