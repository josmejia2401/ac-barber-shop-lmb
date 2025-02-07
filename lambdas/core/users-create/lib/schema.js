const { joi } = require('josmejia2401-js');
exports.schema = joi.object({
    id: joi.number().required(),
    firstName: joi.string().max(100).required(),
    lastName: joi.string().max(100).allow("", undefined, null).optional(),
    email: joi.string().email().required(),
    username: joi.string().required(),
    password: joi.string().required(),
    statusId: joi.string().required(),
    createdAt: joi.string().allow("", undefined, null).optional()
});
