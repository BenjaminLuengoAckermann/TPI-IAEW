const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const validators = require("../validators/ordenes_envio")
const ordenes_envio = require('../models').ShippingOrders;
const shipping_status = require('../models').ShippingStatus;
const deliveries = require("../models").Deliveries
const axios = require("axios");

module.exports = {

    create(req, res) {
        const {error} = validators.ORDER_SCHEMA.validate(req.body, {errors: {wrap: {label: false}}})
        if(error) return res.status(400).send(error.details[0].message)
        // Buscamos el estado creado en la BD para asignarle ese ID
        const responseShippingStatus = shipping_status.findOne({
            where: {
                name: "Creado"
            }
        });

        Promise
            .all([responseShippingStatus])
            .then(responses => {
                // Transformamos las direcciones a strings para almacenar
                let originAddress = req.body.direccionOrigen[0] + ", " +
                req.body.direccionOrigen[1] + ", " + 
                req.body.direccionOrigen[2]

                let destinyAddress =  req.body.direccionDestino[0] + ", " +
                req.body.direccionDestino[1] + ", " + 
                req.body.direccionDestino[2]
                
                return ordenes_envio
                    .create({
                        orderId: req.body.id,
                        shippingStatus: responses[0].id,
                        originAddress: originAddress,
                        destinyAddress: destinyAddress,
                        buyerContact: req.body.contactoComprador,
                        productDetail: req.body.detalleProducto,
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
        // Buscamos en la base un repartidor que no se encuentre repartiendo
        const availableDeliveries = deliveries.findAll({
            where: {
                isDelivering: false
            }
        })
        // Se busca la orden con el ID enviado por parametro
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
                    //console.log(response[1])
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
                                .then(delivery => res.status(200).send({response: delivery, repartidor: randomDelivery.fullname }))
                                .catch(error => res.status(400).send(error))
                        })

                }
                // Si no existe repartidor libre, enviamos un 204 
                else res.sendStatus(204)

            })
    },

    notificar_cambio_estado(req, res) {
        // Buscamos la orden con el parametro enviado y que este en estado En Transito
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
                            ordenes_envio
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
                                    const url_notification = 'http://ecs-services-1705455222.us-east-1.elb.amazonaws.com/api/Envios/' + orderId + '/Novedades'
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
                                        console.log(token.data.access_token)
                                        let body_notification = {estadoEnvio: "Entregado"}
                                        axios.post(url_notification, body_notification, {
                                            headers: {"Content-Type": "application/json",
                                            "Authorization": 'Bearer ' + token.data.access_token}
                                        }).then((response) => {
                                            console.log(response)
                                            return res.status(200).send({response: delivery, msg: "Se ha entregado la notificacion con exito"})

                                        })
                                        .catch((error) => {
                                            console.log("------ ERROR ---------")
                                            console.log(error)
                                            return res.status(400).send(error)
                                        })
                                    })
                                    .catch((error) => {
                                        console.log(error)
                                        //return res.status(400).send(error)
                                    });
                                    
                                    //return res.status(200).send(delivery)
                                })
                                .catch(error => {return res.status(400).send(error)})
                        })

                }
                else return res.sendStatus(204)

            })
    }
}