const { buildBadRequestError } = require('./global-exception-handler');
exports.validatePayload = function (schema, payload, allowUnknown = false) {
    const result = schema.validate(payload, {
        allowUnknown: allowUnknown
    });
    if (result.error) {
        let errors = result.error.details.map(p => ({
            message: p.message.replace('\"', "").replace('\"', ""),
            type: p.type
        }));
        return buildBadRequestError(
            message = '¡Ups! Error en la solicitud.',
            stackTrace = [],
            errors = errors
        );
    }
    return null;
}