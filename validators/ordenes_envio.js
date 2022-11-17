const Joi = require("joi")
const messages = require("./spanish-joi-messages.json")

module.exports = Object.freeze({
// Este esquema se usa para validar los datos ingresados, sera usado cuando esten los campos listos en la BD
    ORDER_SCHEMA : Joi.object({
        id: Joi.number().required().label("ID").messages(messages),
        direccionOrigen: Joi.any().required()
            .label("Dirección Origen").messages(messages), 
        direccionDestino: Joi.any().required()
            .label("Dirección Destino").messages(messages),
        contactoComprador: Joi.string().min(3).max(100).required()
            .label("Contacto Comprador").messages(messages),
        shippingStatus: Joi.string().optional().allow(null)
            .label("Estado del Envio").messages(messages),
        detalleProducto: Joi.string().min(3).max(100).required()
            .label("Detalle del Producto").messages(messages), //Joi.string(),
        deliveryData: Joi.number().optional().allow(null)
            .label("Repartidor").messages(messages),
    })
})
