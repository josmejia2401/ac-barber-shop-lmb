const {
    JWT,
    logger,
    commonUtils,
    dynamoDBRepository,
    responseHandler,
    listValues,
    globalException,
    commonConstants
} = require('josmejia2401-js');
const constants = require('../lib/constants');

exports.doAction = async function (event, context) {
    try {
        const traceId = commonUtils.getTraceID(event.headers || {});
        if (event.body !== undefined && event.body !== null) {
            const body = JSON.parse(event.body);
            const options = {
                requestId: traceId,
                schema: undefined
            };
            const resultData = await dynamoDBRepository.scan({
                expressionAttributeValues: {
                    ':username': {
                        'S': `${body.username}`
                    },
                    ':password': {
                        'S': `${body.password}`
                    },
                    ':status': {
                        'N': `${listValues.findStatusById(1).id}`
                    }
                },
                expressionAttributeNames: {
                    '#username': 'username',
                    '#password': 'password',
                    '#status': 'status'
                },
                projectionExpression: 'id, firstName, lastName, email, username',
                filterExpression: '#username=:username AND #password=:password AND #status=:status',
                limit: 1,
                tableName: commonConstants.TABLES.users
            }, options);
            if (resultData.results.length === 0) {
                return globalException.buildUnauthorized('Error al iniciar sesión; ID de usuario o contraseña son incorrectos');
            } else {
                const tokens = await dynamoDBRepository.scan({
                    expressionAttributeValues: {
                        ':userId': {
                            S: `${resultData.results[0].id.S}`
                        }
                    },
                    projectionExpression: undefined,
                    filterExpression: 'userId=:userId',
                    tableName: commonConstants.TABLES.token
                }, options);
                if (tokens.results.length > 0) {
                    const promises = tokens.results.map(token => dynamoDBRepository.deleteItem({
                        key: {
                            id: {
                                S: `${token.id.S}`
                            }
                        },
                        tableName: commonConstants.TABLES.token
                    }, options));
                    await Promise.all(promises);
                }
                const tokenId = commonUtils.buildUuid();
                const accessToken = JWT.sign({
                    username: resultData.results[0].username.S,
                    name: resultData.results[0].firstName.S,
                    tokenId: `${tokenId}`,
                    id: `${resultData.results[0].id.S}`
                });
                await dynamoDBRepository.putItem({
                    item: {
                        id: { S: `${tokenId}` },
                        userId: { S: `${resultData.results[0].id.S}` },
                        accessToken: { S: `${accessToken}` },
                        createdAt: { S: `${new Date().toISOString()}` },
                    },
                    tableName: commonConstants.TABLES.token
                }, options);
                return responseHandler.successResponse({
                    accessToken: accessToken
                });
            }
        } else {
            return globalException.buildInternalError('Error al iniciar sesión; ID de usuario o contraseña no han sido proveídos');
        }
    } catch (err) {
        logger.error({ message: err, requestId: '' });
        return globalException.buildInternalError("Error al iniciar sesión; Error interno, intenta más tarde")
    }
}