const { joi } = require('josmejia2401-js');
exports.schema = joi.object({
    id: joi.number().required(),
    firstName: joi.string().max(100).required(),
    lastName: joi.string().max(100).allow("").optional(),
    documentTypeId: joi.string().max(5).required(),
    documentNumber: joi.string().max(20).required(),
    email: joi.string().email().required(),
    username: joi.string().required(),
    password: joi.string().required(),
    statusId: joi.string().required(),
    createdAt: joi.string().max(24).required(),
    preferences: joi.object({
        website: joi.string().max(500).allow("").optional(),
        corporateImage: joi.string().max(500).allow("").optional(),
        currency: joi.string().max(5).allow("").optional(),
        language: joi.string().max(5).allow("").optional(),
    }).optional()
});
