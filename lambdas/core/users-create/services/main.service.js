const {
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
    logger.info({ requestId: traceID });
    try {
        if (!commonUtils.isEmpty(event.body)) {
            const body = JSON.parse(event.body);
            body["id"] = commonUtils.buildUuid();
            body["createdAt"] = new Date().toISOString();
            body["statusId"] = "PEND";
            const errorBadRequest = schemaValidator.validatePayload(schema.schema, body);
            if (errorBadRequest) {
                return errorBadRequest;
            }
            const usernameExists = await dynamoDBRepository.scan({
                tableName: commonConstants.TABLES.users,
                expressionAttributeValues: {
                    ":username": {
                        "S": `${body.username}`
                    },
                },
                expressionAttributeNames: {
                    "#username": "username"
                },
                projectionExpression: undefined,
                filterExpression: '#username=:username',
                limit: 1,
                lastEvaluatedKey: undefined,
            }, options);
            if (usernameExists.results.length > 0) {
                return globalException.buildBadRequestError('Al parecer la solicitud no es correcta. Usuario invalido.');
            }
            const response = await dynamoDBRepository.putItem({
                tableName: commonConstants.TABLES.users,
                item: commonUtils.mapToDynamoDBFormat(body)
            }, options);
            return responseHandler.successResponse(commonUtils.parseDynamoDBItem(response));
        } else {
            return globalException.buildBadRequestError('Al parecer la solicitud no es correcta. Intenta nuevamente, por favor.');
        }
    } catch (err) {
        logger.error({ message: err, requestId: traceID });
        return globalException.buildInternalError("No pudimos realizar la solicitud. Intenta más tarde, por favor.")
    }
}