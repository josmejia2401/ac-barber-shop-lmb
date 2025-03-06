const { JWT, logger, commonUtils, dynamoDBRepository, commonConstants } = require('josmejia2401-js');

exports.handler = async (event) => {
    const traceId = commonUtils.getTraceID(event.headers || {});
    const response = {
        "isAuthorized": false,
        "context": {
            "traceID": traceId
        }
    };
    logger.info({ traceID: traceId, message: JSON.stringify(event) });
    try {
        const authorization = commonUtils.getAuthorization(event);
        if (authorization && JWT.isValidToken(authorization)) {
            const tokenDecoded = JWT.decodeToken(authorization);
            const options = {
                requestId: traceId
            };
            const responseToken = await dynamoDBRepository.getItem({
                key: {
                    id: {
                        N: `${tokenDecoded.jti}`
                    }
                },
                projectionExpression: 'id, accessToken, userId, createdAt',
                tableName: commonConstants.TABLES.token
            }, options);
            if (responseToken &&
                Number(tokenDecoded.keyid) === Number(responseToken.data.userId.N) &&
                responseToken.data.accessToken.S === JWT.getOnlyToken(authorization)) {
                response.isAuthorized = true;
            } else if (responseToken && responseToken.data.id && responseToken.data.id.N) {
                await dynamoDBRepository.deleteItem({
                    key: {
                        id: {
                            N: responseToken.data.id.N
                        }
                    },
                    tableName: commonConstants.TABLES.token
                }, options);
            }
        }
    } catch (err) {
        logger.error({ message: err, traceId: traceId });
    }
    logger.info({ traceID: traceId, message: JSON.stringify({ response: response }) });
    return response;
};