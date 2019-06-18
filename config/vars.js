let server = {
    port: 3002
};

let mongoDb = {
    address: '127.0.0.1',
    port: 27017,
    dbName: 'comdexMessages'
};
let jwtSecret = "!Q@W#E$R%T^Y&U*I(O)P_";

module.exports = {
    server,
    mongoDb,
    jwtSecret
};
