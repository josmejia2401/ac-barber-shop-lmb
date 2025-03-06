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
        const queryStringParameters = event.queryStringParameters || {};
        const filterField = commonUtils.buildScanFilterExpression(queryStringParameters, ["id", "userId"], ["firstName", "lastName"]);
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
        const response = await dynamoDBRepository.scan({
            expressionAttributeValues: commonUtils.isEmpty(filterField.expressionAttributeValues) ? undefined : filterField.expressionAttributeValues,
            expressionAttributeNames: commonUtils.isEmpty(filterField.expressionAttributeNames) ? undefined : filterField.expressionAttributeNames,
            projectionExpression: undefined,
            filterExpression: commonUtils.isEmpty(filterField.filterExpression) ? undefined : filterField.filterExpression,
            limit: 10,
            lastEvaluatedKey: lastEvaluatedKey,
            tableName: commonConstants.TABLES.employees
        }, options);
        response.data = response.data.map(p => commonUtils.parseDynamoDBItem(p));
        return responseHandler.successResponse(response);
    } catch (err) {
        logger.error({ message: err, requestId: traceID });
        return globalException.buildInternalError("No pudimos realizar la solicitud. Intenta más tarde, por favor.")
    }
}