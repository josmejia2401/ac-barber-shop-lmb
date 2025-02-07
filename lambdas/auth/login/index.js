const loginService = require("./services/login.service");
exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    return loginService.doAction(event, context);
}