let messageController = require('../controllers/message.controller');
let messageValidation = require('../validations/message.validation');

module.exports = (server) => {
    server.get('/message', messageValidation.getMessage, messageController.getMessage);
    server.put('/message', messageValidation.updateMessage, messageController.updateMessage);
    server.get('/message/xml', messageValidation.getMessageFileDown, messageController.getMessageFileDown);
    server.post('/message', messageValidation.updateMessage, messageController.addMessage);
   // server.post('/message/testing', appMessageValidation.updateMessage, appMessageController.updateMessageNew);
    server.get('/message/search', messageValidation.searchMessage, messageController.searchMessage);
//    server.get('/message/xml', appMessageValidation.getMessageFile, appMessageController.getMessageFile);
};
