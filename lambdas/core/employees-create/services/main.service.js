const {
    logger,
    commonUtils,
    dynamoDBRepository,
    responseHandler,
    globalException,
    schemaValidator,
    commonConstants,
    JWT
} = require('josmejia2401-js');
const schema = require('../lib/schema');
exports.doAction = async function (event, _context) {
    const traceID = commonUtils.getTraceID(event.headers || {});
    const options = { requestId: traceID };
    logger.info({ requestId: traceID });
    try {
        if (!commonUtils.isEmpty(event.body)) {
            const authorization = commonUtils.getAuthorization(event);
            const tokenDecoded = JWT.decodeToken(authorization);
            const body = JSON.parse(event.body);
            body["id"] = commonUtils.buildUuid();
            body["createdAt"] = body["createdAt"] || new Date().toISOString();
            body["userId"] = Number(tokenDecoded?.keyid);
            const errorBadRequest = schemaValidator.validatePayload(schema.schema, body);
            if (errorBadRequest) {
                return errorBadRequest;
            }
            const usernameExists = await dynamoDBRepository.query({
                tableName: commonConstants.TABLES.employees,
                keyConditionExpression: "#id=:id AND #userId=:userId",
                expressionAttributeValues: {
                    ":username": {
                        "S": `${body.username}`
                    },
                    ":id": {
                        "N": `${body["id"]}`
                    },
                    ":userId": {
                        "N": `${tokenDecoded?.keyid}`
                    }
                },
                expressionAttributeNames: {
                    "#username": "username",
                    "#id": "id",
                    "#userId": "userId"
                },
                projectionExpression: undefined,
                filterExpression: '#username=:username',
                limit: 1,
                lastEvaluatedKey: undefined,
            }, options);
            if (usernameExists.data.length > 0) {
                return globalException.buildBadRequestError('Al parecer la solicitud no es correcta. Usuario invalido.');
            }
            const response = await dynamoDBRepository.putItem({
                tableName: commonConstants.TABLES.employees,
                item: commonUtils.mapToDynamoDBFormat(body)
            }, options);
            response.data = body;
            return responseHandler.successResponse(response);
        } else {
            return globalException.buildBadRequestError('Al parecer la solicitud no es correcta. Intenta nuevamente, por favor.');
        }
    } catch (err) {
        logger.error({ message: err, requestId: traceID });
        return globalException.buildInternalError("No pudimos realizar la solicitud. Intenta más tarde, por favor.")
    }
}