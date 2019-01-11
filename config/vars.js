let server = {
  port: 3030
};

let mongoDb = {
  address: '127.0.0.1',
  port: 27017,
  dbName: 'comdex-messages'
};
let jwtSecret = "_";

module.exports = {
  server,
  mongoDb,
  jwtSecret
};
