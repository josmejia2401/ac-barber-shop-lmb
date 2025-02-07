const { joi } = require('josmejia2401-js');
exports.schema = joi.object({
    id: joi.number().required(),
    firstName: joi.string().max(100).allow("", undefined, null).optional(),
    lastName: joi.string().max(100).allow("", undefined, null).optional(),
    email: joi.string().allow("", undefined, null).optional(),
    username: joi.string().allow("", undefined, null).optional(),
    password: joi.string().allow("", undefined, null).optional(),
    statusId: joi.string().allow("", undefined, null).optional(),
    createdAt: joi.string().allow("", undefined, null).optional(),
});
