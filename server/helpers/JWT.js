let jwt = require('jsonwebtoken');
let jwtDbo = require('../dbos/jwt.dbo');
const secretKey = require('../../config/vars').jwtSecret;
let async = require('async');

let issueToken = (args, callback) => {
  var issuedAt = new Date().getTime(); //Math.floor(Date.now() / 1000);
  var notBefore = issuedAt + (60 * 60 * 1000);
  var expire = notBefore + (35 * 60 * 60 * 1000);
  data = {
    iat: issuedAt, // Issued at: time when the token was generated
    nbf: notBefore, // Not before
    exp: expire, // Expire
    data: args
  };
  token = jwt.sign(data, secretKey);
  async.waterfall([
    (next) => {
      jwtDbo.addAdd({
        createdOn: issuedAt,
        expiresOn: expire,
        token: token
      }, (error, result) => {
        if (error) {
          next(error, null);
        } else {
          next(null, result);
        }
      })
    }
  ], (error, result) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, token);
    }
  })
}

let verifyJWT = (token, cb) => {
  async.waterfall([
    (next) => {
      jwtDbo.getJwt({
        token
      }, (error, result) => {
        if (error) {
          next(error, null);
        } else if (result && result.length) {
          next(null);
        } else {
          next({
            status: 400,
            message: "token not valid"
          }, null);
        }
      });
    },
    (next) => {
      try {
        let decoded = jwt.decode(token, secretKey);
        if (decoded.exp < new Date().getTime()) {
          next({
            status: 400,
            message: "Token expired"
          }, null);
        } else {
          next(null, decoded.data[0]);
        }
      } catch (e) {
        next(e, null);
      }
    }
  ], (error, result) => {
    if (error) {
      cb(error, null);
    } else {
      cb(null, result);
    }
  })

}
module.exports = {
  issueToken,
  verifyJWT
}