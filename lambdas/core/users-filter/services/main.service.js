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
        const filterField = commonUtils.buildScanFilterExpression(queryStringParameters, []);
        let lastEvaluatedKey = undefined;
        if (queryStringParameters && queryStringParameters.id) {
            lastEvaluatedKey = {
                id: {
                    N: `${queryStringParameters.id}`
                }
            }
        }
        const response = await dynamoDBRepository.scan({
            expressionAttributeValues: filterField.expressionAttributeValues,
            expressionAttributeNames: filterField.expressionAttributeNames,
            projectionExpression: undefined,
            filterExpression: filterField.filterExpression,
            limit: 10,
            lastEvaluatedKey: lastEvaluatedKey,
            tableName: commonConstants.TABLES.users
        }, options);
        response.results = response.results.map(p => commonUtils.parseDynamoDBItem(p));
        return responseHandler.successResponse(response);
    } catch (err) {
        logger.error({ message: err, requestId: traceID });
        return globalException.buildInternalError("No pudimos realizar la solicitud. Intenta más tarde, por favor.")
    }
}