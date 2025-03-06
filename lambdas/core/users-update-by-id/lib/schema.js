const { joi } = require('josmejia2401-js');
exports.schema = joi.object({
    id: joi.number().required(),
    firstName: joi.string().max(100).allow("").optional(),
    lastName: joi.string().max(100).allow("").optional(),
    documentTypeId: joi.string().max(5).allow("").optional(),
    documentNumber: joi.string().max(20).allow("").optional(),
    email: joi.string().email().allow("").optional(),
    username: joi.string().allow("").optional(),
    password: joi.string().allow("").optional(),
    statusId: joi.string().allow("").optional(),
    createdAt: joi.string().max(24).allow("").optional(),
    preferences: joi.object({
        website: joi.string().max(500).allow("").optional(),
        corporateImage: joi.string().max(500).allow("").optional(),
        currency: joi.string().max(5).allow("").optional(),
        language: joi.string().max(5).allow("").optional(),
    }).optional()
});
