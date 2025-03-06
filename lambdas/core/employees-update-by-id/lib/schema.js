const { joi } = require('josmejia2401-js');
exports.schema = joi.object({
    id: joi.number().required(),
    userId: joi.number().required(),
    firstName: joi.string().max(100).allow("").optional(),
    lastName: joi.string().max(100).allow("").optional(),
    documentTypeId: joi.string().max(5).allow("").optional(),
    documentNumber: joi.string().max(20).allow("").optional(),
    genderId: joi.string().max(5).allow("").optional(),
    nationalityId: joi.string().max(5).allow("").optional(),
    birthdate: joi.string().max(19).allow("").optional(),
    maritalStatusId: joi.string().max(5).allow("").optional(),
    statusId: joi.string().max(5).allow("").optional(),
    createdAt: joi.string().max(24).allow("").optional(),
    contactInformation: joi.object({
        email: joi.string().email().max(100).allow("").optional(),
        phone: joi.string().max(15).allow("").optional(),
        address: joi.string().max(100).allow("").optional(),
        corporateEmail: joi.string().email().max(100).allow("").optional()
    }).optional(),
    employmentInformation: joi.object({
        position: joi.string().max(75).allow("").optional(),
        department: joi.string().max(75).allow("").optional(),
        dateHiring: joi.string().max(19).allow("").optional(),
        typeContractId: joi.string().max(5).allow("").optional(),
        directBoss: joi.string().max(100).allow("").optional()
    }).optional(),
    bankingInformation: joi.object({
        bankAccountNumber: joi.string().max(20).allow("").optional(),
        bankId: joi.string().max(5).allow("").optional(),
        accountTypeId: joi.string().max(5).allow("").optional(),
    }).optional(),
    additionalInformation: joi.object({
        description: joi.string().max(200).allow("").optional(),
    }).optional()
});
