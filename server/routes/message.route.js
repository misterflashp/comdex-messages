let messageController = require('../controllers/message.controller');
let messageValidation = require('../validations/message.validation');

module.exports = (server) => {
    server.post('/message', messageValidation.updateMessage, messageController.addMessage);
    server.put('/message', messageValidation.updateMessage, messageController.updateMessage);
    server.get('/message', messageValidation.getMessage, messageController.getMessage);
    server.get('/message/download', messageValidation.getMessageFileDown, messageController.getMessageFileDown);
    server.get('/message/search', messageValidation.searchMessage, messageController.searchMessage);
    //    server.get('/message/xml', appMessageValidation.getMessageFile, appMessageController.getMessageFile);
    // server.post('/message/testing', appMessageValidation.updateMessage, appMessageController.updateMessageNew);
};