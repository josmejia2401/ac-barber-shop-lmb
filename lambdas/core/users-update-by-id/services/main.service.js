const {
    JWT,
    logger,
    commonUtils,
    dynamoDBRepository,
    responseHandler,
    globalException,
    schemaValidator,
    commonConstants
} = require('josmejia2401-js');
const schema = require('../lib/schema');
exports.doAction = async function (event, _context) {
    const traceID = commonUtils.getTraceID(event.headers || {});
    const options = { requestId: traceID };
    try {
        logger.info({ message: JSON.stringify(event), requestId: traceID });
        if (!commonUtils.isEmpty(event.pathParameters)) {
            const pathParameters = event.pathParameters;
            const errorUserValidated = commonUtils.validateUserIdWithToken(event, pathParameters.id);
            if (!commonUtils.isEmpty(errorUserValidated)) {
                return errorUserValidated;
            }
            const body = JSON.parse(event.body);
            body["id"] = Number(pathParameters.id);
            const errorBadRequest = schemaValidator.validatePayload(schema.schema, body);
            if (errorBadRequest) {
                return errorBadRequest;
            }
            // ID no se debe actualizar
            const itemToUpdate = commonUtils.buildUpdateExpression(body, ['id']);
            await dynamoDBRepository.updateItem({
                key: {
                    id: {
                        N: `${body.id}`
                    }
                },
                expressionAttributeNames: itemToUpdate.expressionAttributeNames,
                expressionAttributeValues: itemToUpdate.expressionAttributeValues,
                updateExpression: itemToUpdate.updateExpression,
                conditionExpression: undefined,
                filterExpression: "attribute_exists(id)",
                tableName: commonConstants.TABLES.users
            }, options);
            return responseHandler.successResponse(body);
        } else {
            return globalException.buildBadRequestError('Al parecer la solicitud no es correcta. Intenta nuevamente, por favor.');
        }
    } catch (err) {
        logger.error({ message: err, requestId: traceID });
        return globalException.buildInternalError("No pudimos realizar la solicitud. Intenta más tarde, por favor.")
    }
}