const {
    logger,
    commonUtils,
    dynamoDBRepository,
    responseHandler,
    globalException,
    commonConstants
} = require('josmejia2401-js');
exports.doAction = async function (event, _context) {
    const traceID = commonUtils.getTraceID(event.headers || {});
    const options = { requestId: traceID };
    try {
        logger.info({ message: JSON.stringify(event), requestId: traceID });
        const authorization = commonUtils.getAuthorization(event);
        const tokenDecoded = JWT.decodeToken(authorization);
        const userId = Number(tokenDecoded?.keyid);
        const queryStringParameters = event.queryStringParameters || {};
        if (commonUtils.isEmpty(queryStringParameters.customerId)) {
            return globalException.buildBadRequestError('Al parecer la solicitud no es correcta. Intenta nuevamente, por favor.');
        }
        let lastEvaluatedKey = undefined;
        if (queryStringParameters && queryStringParameters.id && queryStringParameters.userId) {
            lastEvaluatedKey = {
                id: {
                    N: `${queryStringParameters.id}`
                },
                userId: {
                    N: `${queryStringParameters.userId}`
                }
            }
        }
        const filterField = commonUtils.buildScanFilterExpression(queryStringParameters, ["id", "userId"], []);
        filterField.expressionAttributeValues = filterField.expressionAttributeValues || {};
        filterField.expressionAttributeNames = filterField.expressionAttributeNames || {};
        filterField.filterExpression = filterField.filterExpression || "";
        filterField.expressionAttributeValues = {
            ...filterField.expressionAttributeValues,
            ":userId": {
                N: `${userId}`
            }
        };
        filterField.expressionAttributeNames = {
            ...filterField.expressionAttributeNames,
            "#userId": "userId"
        };
        filterField.filterExpression = commonUtils.isEmpty(filterField.filterExpression) ?
            "#userId=:userId"
            :
            filterField.filterExpression.concat(" AND ").concat("#userId=:userId");

        const response = await dynamoDBRepository.scan({
            expressionAttributeValues: commonUtils.isEmpty(filterField.expressionAttributeValues) ? undefined : filterField.expressionAttributeValues,
            expressionAttributeNames: commonUtils.isEmpty(filterField.expressionAttributeNames) ? undefined : filterField.expressionAttributeNames,
            projectionExpression: undefined,
            filterExpression: commonUtils.isEmpty(filterField.filterExpression) ? undefined : filterField.filterExpression,
            limit: 10,
            lastEvaluatedKey: lastEvaluatedKey,
            tableName: commonConstants.TABLES.customers
        }, options);
        response.data = response.data.map(p => commonUtils.parseDynamoDBItem(p));
        response.metadata.lastEvaluatedKey = response.metadata.lastEvaluatedKey ? commonUtils.parseDynamoDBItem(response.metadata.lastEvaluatedKey) : undefined;
        return responseHandler.successResponse(response);
    } catch (err) {
        logger.error({ message: err, requestId: traceID });
        return globalException.buildInternalError("No pudimos realizar la solicitud. Intenta más tarde, por favor.")
    }
}