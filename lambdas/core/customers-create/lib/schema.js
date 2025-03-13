const { joi } = require('josmejia2401-js');
exports.schema = joi.object({
    id: joi.number().required(),
    userId: joi.number().required(),
    firstName: joi.string().max(100).required(),
    lastName: joi.string().max(100).allow("").optional(),
    documentTypeId: joi.string().max(5).allow("").optional(),
    documentNumber: joi.string().max(20).allow("").optional(),
    genderId: joi.string().max(5).allow("").optional(),
    nationalityId: joi.string().max(5).allow("").optional(),
    birthdate: joi.string().max(19).allow("").optional(),
    statusId: joi.string().max(5).allow("").optional(),
    createdAt: joi.string().max(24).allow("").optional(),
    contactInformation: joi.object({
        email: joi.string().email().max(100).allow("").optional(),
        phone: joi.string().max(15).allow("").optional(),
        address: joi.string().max(100).allow("").optional()
    }).optional(),
    segmentationAndTags: joi.object({
        customerTypeId: joi.string().max(5).allow("").optional(),
        customerTags: joi.array().items(joi.string()).empty(joi.array().length(0)).optional(),
    }).optional(),
    preferences: joi.object({
        communicationChannels: joi.array().items(joi.string()).empty(joi.array().length(0)).optional(),
        favoriteCategories: joi.array().items(joi.string()).empty(joi.array().length(0)).optional(),
    }).optional(),
    additionalInformation: joi.object({
        description: joi.string().max(200).allow("").optional(),
    }).optional()
});
