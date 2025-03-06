const mainService = require("./services/main.service");
exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    return mainService.doAction(event, context);
}