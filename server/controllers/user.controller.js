let async = require('async');
let userDbo = require('../dbos/user.dbo');
var jwt = require('../helpers/JWT');
let bcryptHelper = require('../helpers/bcrypt.helper');
let jwtDbo = require('../dbos/jwt.dbo');

let login = (req, res) => {
    let {
        username,
        password
    } = req.body;
    async.waterfall([
        (next) => {
            userDbo.login({
                username
            }, (error, result) => {
                if (error) next({
                    status: 500,
                    message: 'Error while logging in'
                }, null);
                else if (result && result.length) {
                    next(null, result);
                } else {
                    next({
                        status: 400,
                        message: 'Invalid login credentials'
                    }, null);
                }
            });
        },
        (result, next) => {
            let hash = result[0].password;
            bcryptHelper.verifyHash({
                password,
                hash
            }, (error, valid) => {
                if (error) {
                    next({
                        status: 400,
                        message: "Wrong Password entered"
                    }, null);
                } else {
                    next(null, result);
                }
            })
        },
        (result, next) => {
            let user = result[0].username;
            let out = {};
            jwt.issueToken(result, (error, token) => {
                if (error) next({
                    status: 500,
                    message: ' Error occured while creating JWT'
                }, null);
                else {
                    out['token'] = token;
                    next(null, {
                        status: 200,
                        token: out['token'],
                        userDetails: {
                            username: user
                        }
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
}

let signUp = (req, res) => {
    let {
        email,
        password,
        username,
        name
    } = req.body;
    async.waterfall([
        (next) => {
            userDbo.getUserDetails({
                username
            }, (error, result) => {
                if (error) next({
                    status: 500,
                    message: 'Error occured while checking username'
                }, null);
                else if (result && result.length) {
                    next({
                        status: 400,
                        message: "Username already exists"
                    }, null);
                } else {
                    next(null);
                }
            });
        }, (next) => {
            bcryptHelper.genHash({
                password
            }, (error, result) => {
                if (error) {
                    next({
                        status: 400,
                        message: "Error while generating hash"
                    }, null);
                } else {
                    let hash = result.hash;
                    next(null, hash);
                }
            })
        },
        (hash, next) => {
            userDbo.signUp({
                email,
                password: hash,
                name,
                username
            }, (error, result) => {
                if (error) next({
                    status: 500,
                    message: 'Error while signing up'
                }, null);
                else next(null, {
                    status: 200,
                    message: 'Sign Up successful'
                })
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

let logout = (req, res) => {
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
                    next(null, data);
                }
            });
        }, (data, next) => {
            jwtDbo.deleteJwt({
                token
            }, (error, result) => {
                if (error) {
                    next({
                        status: 500,
                        message: "Error while deleting jwt token"
                    }, null);
                } else {
                    next(null, {
                        status: 200,
                        message: "Logged out successfully"
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
}

let logout = (req, res) => {
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
          next(null, data);
        }
      });
    }, (data, next) => {
      jwtDbo.deleteJwt({
        token
      }, (error, result) => {
        if (error) {
          next({
            status: 500,
            message: "Error while deleting jwt token"
          }, null);
        } else {
          next(null, {
            status: 200,
            message: "Logged out successfully"
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

module.exports = {
    login,
    signUp,
    logout
};