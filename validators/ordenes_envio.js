const Joi = require("@hapi/joi")
const messages = require("./spanish-joi-messages.json")

module.exports = Object.freeze({
// Este esquema se usa para validar los datos ingresados, sera usado cuando esten los campos listos en la BD
    ORDER_SCHEMA : Joi.object({
        originAddress: Joi.string().min(3).max(100).required()
            .label("Dirección Origen").messages(messages), 
        destinyAddress: Joi.number().required()
            .label("Dirección Destino").messages(messages),
        buyerContact: Joi.string().max(280).optional().allow(null, "")
            .label("Contacto Comprador").messages(messages),
        shippingStatus: Joi.string().required()
            .label("Estado del Envio").messages(messages),
        productDetail: Joi.optional().allow(null)
            .label("Detalle del Producto").messages(messages), //Joi.string(),
        deliveryData: Joi.number().required()
            .label("Repartidor").messages(messages),
    })
})
