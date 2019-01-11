let logValidation = require('../validations/log.validation');
let logController = require('../controllers/log.controller');
module.exports = (server) => {
    server.get('/logs', logValidation.getLogs, logController.getLogs);
};