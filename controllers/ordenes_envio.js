const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const ordenes_envio = require('../models').ShippingOrders;
const shipping_status = require('../models').ShippingStatus;
const deliveries = require("../models").Deliveries
const axios = require("axios");

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
        const availableDeliveries = deliveries.findAll({
            where: {
                isDelivering: false
            }
        })

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
                    const orderId = response[1].dataValues.orderId
                    const asignarReparto = deliveries.update({
                        isDelivering: true,
                    },
                        {
                            where: {
                                id: randomDelivery.id
                            }
                        })

                    Promise
                        .all([asignarReparto])
                        .then(response => {
                            return ordenes_envio
                                .update({
                                    deliveryData: randomDelivery.id,
                                    shippingStatus: 2
                                },
                                    {
                                        where: {
                                            orderId: orderId
                                        }
                                    },
                                )
                                .then(delivery => res.status(200).send(delivery))
                                .catch(error => res.status(400).send(error))
                        })

                }

                else res.sendStatus(204)

            })
    },

    notificar_cambio_estado(req, res) {

        const orderResponse = ordenes_envio.findOne({
            where: {
                orderId: req.params.orderId,
                shippingStatus: 2
            }
        })

        Promise
            .all([orderResponse])
            .then(response => {
                // si existe la orden de envio
                if (response[0]) {
                    const orderId = response[0].dataValues.orderId
                    // Desocupamos al repartidor
                    const desocuparReparto = deliveries.update({
                        isDelivering: false,
                    },
                        {
                            where: {
                                id: response[0].dataValues.deliveryData
                            }
                        })
                    Promise
                        .all([desocuparReparto])
                        .then(response => {
                            // Actualiza el estado de la orden de envio
                            return ordenes_envio
                                .update({
                                    shippingStatus: 3,
                                    deliveredAt: new Date().toLocaleString()
                                },
                                    {
                                        where: {
                                            orderId: orderId
                                        }
                                    },
                                )
                                .then(delivery => {
                                    // Notificacion via webhook al modulo API Procesador de Envios
                                    // POST /envios/{id_envios}/novedades
                                    const url_auth = "https://dev-pmt16h97.us.auth0.com/oauth/token"
                                    const url_notification = 'http://ecs-services-1705455222.us-east-1.elb.amazonaws.com/api/Envios/'
                                    + orderId + '/Novedades'
                                    const body = {
                                        client_secret: "6pVQtQwSKefZ_4N6hTbo17NHfazaLcyp3gF1GqGLefl64eC_zn8RDrYuHvaYlWrH",
                                        client_id: "C0L2So2k7ZBdKwhMCWwRZCZQYHqThX7a",
                                        grant_type: "client_credentials",
                                        audience: "https://api.procesadorenvios.com"
                                    }
                                    // Primero nos autenticamos en el servidor
                                    axios.post(url_auth, body, {
                                        headers: {
                                            "Content-Type": "application/json",
                                        }
                                    }).then((token) => {
                                        // Si recibimos el token notificamos el cambio de estado del envio
                                        let body_notification = {delivery: delivery}
                                        axios.post(url_notification, body_notification, {
                                            headers: {"Content-Type": "application/json",
                                            Authorization: 'Bearer ' + token}
                                        }).then((response) => {
                                            return res.status(200).send(delivery)

                                        })
                                        .catch((error) => {
                                            return res.status(400).send(error)
                                        })
                                    })
                                    .catch((error) => {
                                        return res.status(400).send(error)
                                    });
                                    
                                    res.status(200).send(delivery)
                                })
                                .catch(error => res.status(400).send(error))
                        })

                }
                else res.sendStatus(204)

            })
    }
}