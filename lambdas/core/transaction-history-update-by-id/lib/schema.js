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
        quantity: joi.number().allow(0).optional(),
        unitPrice: joi.number().allow(0).optional(),
        discount: joi.number().allow(0).optional(),
        taxes: joi.number().allow(0).optional(),
        total: joi.number().allow(0).optional(),
    })).empty(joi.array().length(0)).optional(),
    billingInfo: joi.object({
        invoiceNumber: joi.number().required(),
        invoiceDate: joi.string().max(24).allow("").optional(),
        taxId: joi.number().allow(0).optional(),
    }).optional(),
    paymentMethod: joi.object({
        paymentMethodId: joi.number().allow(0).optional(),
        description: joi.string().max(100).allow("").optional(),
    }).optional(),
    shippingInfo: joi.object({
        address: joi.object({
            street: joi.string().max(100).allow("").optional(),
            cityId: joi.string().max(5).allow("").required(),
            stateId: joi.string().max(5).allow("").required(),
            postalCode: joi.string().max(20).allow("").optional(),
            countryId: joi.string().max(5).allow("").required(),
        }).optional(),
        shippingMethodId: joi.string().max(5).allow("").optional(),
        shippingCost: joi.number().allow(0).optional(),
        shippingStatusId: joi.string().max(5).allow("").optional(),
    }).optional(),
    additionalInformation: joi.object({
        description: joi.string().max(200).allow("").optional(),
    }).optional()
});
