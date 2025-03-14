const { joi } = require('josmejia2401-js');
exports.schema = joi.object({
    id: joi.number().required(),
    userId: joi.number().required(),
    customerId: joi.number().required(),
    typeId: joi.string().max(5).allow("").optional(),
    totalAmount: joi.number().allow(0).optional(),
    statusId: joi.string().max(5).allow("").optional(),
    createdAt: joi.string().max(24).allow("").optional(),
    products: joi.array().items(joi.object({
        id: joi.number().required(),
        productName: joi.string().allow("").optional(),
        productCategoryId: joi.string().max(5).allow("").optional(),
        quantity: joi.number().required(),
        unitPrice: joi.number().required(),
        discount: joi.number().required(),
        taxes: joi.number().required(),
        total: joi.number().required(),
    })).empty(joi.array().length(0)).optional(),
    billingInfo: joi.object({
        invoiceNumber: joi.number().required(),
        invoiceDate: joi.string().max(24).required(),
        taxId: joi.number().required(),
    }).optional(),
    paymentMethod: joi.object({
        paymentMethodId: joi.number().required(),
        description: joi.string().max(100).required(),
    }).optional(),
    shippingInfo: joi.object({
        address: joi.object({
            street: joi.string().max(100).required(),
            cityId: joi.string().max(5).allow("").required(),
            stateId: joi.string().max(5).allow("").required(),
            postalCode: joi.string().max(20).required(),
            countryId: joi.string().max(5).allow("").required(),
        }).optional(),
        shippingMethodId: joi.string().max(5).allow("").optional(),
        shippingCost: joi.number().required(),
        shippingStatusId: joi.string().max(5).allow("").optional(),
    }).optional(),
    additionalInformation: joi.object({
        description: joi.string().max(200).allow("").optional(),
    }).optional()
});
