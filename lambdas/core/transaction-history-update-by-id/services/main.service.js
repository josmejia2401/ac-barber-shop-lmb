const {
    JWT,
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
    try {
        logger.info({ message: JSON.stringify(event), requestId: traceID });
        if (!commonUtils.isEmpty(event.pathParameters)) {
            const authorization = commonUtils.getAuthorization(event);
            const tokenDecoded = JWT.decodeToken(authorization);
            const pathParameters = event.pathParameters;
            const body = JSON.parse(event.body);
            body["id"] = Number(pathParameters.id);
            body["userId"] = tokenDecoded?.keyid;
            const errorBadRequest = schemaValidator.validatePayload(schema.schema, body);
            if (errorBadRequest) {
                return errorBadRequest;
            }
            const usernameExists = await dynamoDBRepository.getItem({
                tableName: commonConstants.TABLES.transactionHistory,
                key: {
                    "id": {
                        "N": `${body["id"]}`
                    },
                    "userId": {
                        "N": `${tokenDecoded?.keyid}`
                    }
                },
                expressionAttributeNames: {
                    "#id": "id",
                    "#userId": "userId"
                },
                projectionExpression: "id, userId"
            }, options);
            if (usernameExists.data.length === 0) {
                return globalException.buildBadRequestError('Al parecer la solicitud no es correcta. Factura no existe.');
            }
            // ID no se debe actualizar
            const itemToUpdate = commonUtils.buildUpdateExpression(body, ['id', 'userId']);
            if (commonUtils.isEmpty(itemToUpdate)) {
                return globalException.buildBadRequestError('Ups! No hay datos para actualizar.');
            }
            const response = await dynamoDBRepository.updateItem({
                key: {
                    id: {
                        N: `${body.id}`
                    },
                    userId: {
                        N: `${tokenDecoded.keyid}`
                    }
                },
                expressionAttributeNames: itemToUpdate.expressionAttributeNames,
                expressionAttributeValues: itemToUpdate.expressionAttributeValues,
                updateExpression: itemToUpdate.updateExpression,
                conditionExpression: undefined,
                filterExpression: "attribute_exists(id)",
                tableName: commonConstants.TABLES.transactionHistory
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