const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const ordenes_envio = require('../models').ShippingOrders;
const shipping_status = require('../models').ShippingStatus;
const deliveries = require("../models").Deliveries

module.exports = {

    create(req, res) {

        const responseShippingStatus = shipping_status.findOne({
            where: {
                name: "Creado"
            }
        });

        Promise
            .all([responseShippingStatus])
            .then(responses => {
                return ordenes_envio
                    .create({
                        shippingStatus: responses[0].id,
                        originAddress: req.body.originAddress,
                        destinyAddress: req.body.destinyAddress,
                        buyerContact: req.body.buyerContact,
                        productDetail: req.body.productDetail,
                        deliveryData: req.body.deliveryData
                    })
                    .then(ordenes => res.status(200).send(ordenes))
                    .catch(error => res.status(400).send(error))
            })
    },

    find(req, res) {
        return ordenes_envio
            .findOne({
                where: {
                    orderId: req.params.orderId
                }
            })
            .then(ordenes_envio => res.status(200).send(ordenes_envio))
            .catch(error => res.status(400).send(error))
    },

    asignar_repartidor(req, res) {
        const availableDeliveries = deliveries.findAll()

        const orderResponse = ordenes_envio.findOne({
            where: {
                orderId: req.params.orderId
            }
        })

        Promise
            .all([availableDeliveries, orderResponse])
            .then(response => {
                // si existe la orden de envio
                if (response[1]) {
                    // se elige un repartidor random entre todos
                    const randomDelivery = response[0][Math.floor(Math.random() * response[0].length)].dataValues
                    console.log(randomDelivery)
                    console.log(response[1])
                    return ordenes_envio
                        .update({
                            deliveryData: randomDelivery.id,
                            shippingStatus: 2
                        },
                            {
                                where: {
                                    orderId: response[1].dataValues.orderId
                                }
                            },
                        )
                        .then(delivery => res.status(200).send(delivery))
                        .catch(error => res.status(400).send(error))
                }
                else res.sendStatus(204)

            })
    },

    notificar_cambio_estado(req, res) {

        const orderResponse = ordenes_envio.findOne({
            where: {
                orderId: req.params.orderId
            }
        })

        Promise
            .all([orderResponse])
            .then(response => {
                // si existe la orden de envio
                if (response[0]) {
                    return ordenes_envio
                        .update({
                            shippingStatus: 3
                        },
                            {
                                where: {
                                    orderId: response[0].dataValues.orderId
                                }
                            },
                        )
                        .then(delivery => res.status(200).send(delivery))
                        .catch(error => res.status(400).send(error))
                }
                else res.sendStatus(204)

            })
    }
}