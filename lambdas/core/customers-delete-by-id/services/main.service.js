const {
    logger,
    commonUtils,
    dynamoDBRepository,
    responseHandler,
    globalException,
    commonConstants,
    JWT
} = require('josmejia2401-js');
exports.doAction = async function (event, _context) {
    const traceID = commonUtils.getTraceID(event.headers || {});
    const options = { requestId: traceID };
    try {
        logger.info({ message: JSON.stringify(event), requestId: traceID });
        if (!commonUtils.isEmpty(event.pathParameters)) {
            const authorization = commonUtils.getAuthorization(event);
            const tokenDecoded = JWT.decodeToken(authorization);
            const response = await dynamoDBRepository.updateItem({
                key: {
                    id: {
                        N: `${event.pathParameters.id}`
                    },
                    userId: {
                        N: `${tokenDecoded.keyid}`
                    }
                },
                expressionAttributeNames: {
                    "#statusId": "statusId"
                },
                expressionAttributeValues: {
                    ":statusId": {
                        "S": "ELI"
                    }
                },
                updateExpression: "SET #statusId=:statusId",
                conditionExpression: undefined,
                filterExpression: "attribute_exists(id)",
                tableName: commonConstants.TABLES.customers
            }, options);
            response.data = { id: Number(event.pathParameters.id), statusId: "ELI" };
            return responseHandler.successResponse(response);
        } else {
            return globalException.buildBadRequestError('Al parecer la solicitud no es correcta. Intenta nuevamente, por favor.');
        }
    } catch (err) {
        logger.error({ message: err, requestId: traceID });
        return globalException.buildInternalError("No pudimos realizar la solicitud. Intenta más tarde, por favor.")
    }
}