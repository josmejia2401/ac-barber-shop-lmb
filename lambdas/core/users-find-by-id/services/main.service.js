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
        if (!commonUtils.isEmpty(event.pathParameters)) {
            const pathParameters = event.pathParameters;
            const errorUserValidated = commonUtils.validateUserIdWithToken(event, pathParameters.id);
            if (!errorUserValidated) {
                return globalException.buildBadRequestError('Al parecer la solicitud no es permitida. Intenta nuevamente, por favor.');;
            }
            const response = await dynamoDBRepository.getItem({
                key: {
                    id: {
                        N: `${pathParameters.id}`
                    }
                },
                tableName: commonConstants.TABLES.users,
            }, options);
            if (!response) {
                return globalException.buildNotFoundError({});
            }
            response.data = commonUtils.parseDynamoDBItem(response.data);
            delete response.data["password"];
            return responseHandler.successResponse(response);
        } else {
            return globalException.buildBadRequestError('Al parecer la solicitud no es correcta. Intenta nuevamente, por favor.');
        }
    } catch (err) {
        logger.error({ message: err, requestId: traceID });
        return globalException.buildInternalError("No pudimos realizar la solicitud. Intenta más tarde, por favor.")
    }
}