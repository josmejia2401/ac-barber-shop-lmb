const {
    JWT,
    logger,
    commonUtils,
    dynamoDBRepository,
    responseHandler,
    globalException,
    commonConstants
} = require('josmejia2401-js');
exports.doAction = async function (event, context) {
    try {
        const traceId = commonUtils.getTraceID(event.headers || {});
        if (event.body !== undefined && event.body !== null) {
            const body = JSON.parse(event.body);
            const options = {
                requestId: traceId,
                schema: undefined
            };
            const responseUsers = await dynamoDBRepository.scan({
                expressionAttributeValues: {
                    ':username': {
                        'S': `${body.username}`
                    },
                    ':password': {
                        'S': `${body.password}`
                    },
                    ':statusId': {
                        'S': 'ELI'
                    }
                },
                expressionAttributeNames: {
                    '#username': 'username',
                    '#password': 'password',
                    '#statusId': 'statusId'
                },
                projectionExpression: 'id, firstName, lastName, email, username',
                filterExpression: '#username=:username AND #password=:password AND #statusId<>:statusId',
                limit: 1,
                tableName: commonConstants.TABLES.users
            }, options);
            if (responseUsers.data.length === 0) {
                return globalException.buildUnauthorized('Error al iniciar sesión; ID de usuario o contraseña son incorrectos');
            } else {
                const userId = responseUsers.data[0].id.N;
                const responseTokens = await dynamoDBRepository.scan({
                    expressionAttributeValues: {
                        ':userId': {
                            N: `${userId}`
                        }
                    },
                    projectionExpression: undefined,
                    filterExpression: 'userId=:userId',
                    tableName: commonConstants.TABLES.token
                }, options);
                if (responseTokens.data.length > 0) {
                    const promises = responseTokens.data.map(token => dynamoDBRepository.deleteItem({
                        key: {
                            id: {
                                N: `${token.id.N}`
                            }
                        },
                        tableName: commonConstants.TABLES.token
                    }, options));
                    await Promise.all(promises);
                }
                const tokenId = commonUtils.buildUuid();
                const accessToken = JWT.sign({
                    username: responseUsers.data[0].username.S,
                    name: responseUsers.data[0].firstName.S,
                    tokenId: `${tokenId}` ,
                    id: `${userId}`
                });
                const response = await dynamoDBRepository.putItem({
                    item: {
                        id: { N: `${tokenId}` },
                        userId: { N: `${userId}` },
                        accessToken: { S: `${accessToken}` },
                        createdAt: { S: `${new Date().toISOString()}` },
                    },
                    tableName: commonConstants.TABLES.token
                }, options);
                response.data = { accessToken: accessToken };
                return responseHandler.successResponse(response);
            }
        } else {
            return globalException.buildInternalError('Error al iniciar sesión; ID de usuario o contraseña no han sido proveídos');
        }
    } catch (err) {
        logger.error({ message: err, requestId: '' });
        return globalException.buildInternalError("Error al iniciar sesión; Error interno, intenta más tarde")
    }
}