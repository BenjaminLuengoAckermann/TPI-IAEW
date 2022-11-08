const { where } = require('sequelize');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const deliveries = require('../models').Deliveries;

module.exports = {

    create(req, res) {

        return deliveries
            .create({
                fullname: req.body.fullname
            })
            .then(delivery => res.status(200).send(delivery))
            .catch(error => res.status(400).send(error))
    },
    findAll(req, res) {
        return deliveries
            .findAll()
            .then(deliveries => res.status(200).send(deliveries))
            .catch(error => res.status(400).send(error))
    },

    findOne(req, res) {
        return deliveries
            .findOne({
                where: {
                    id: req.params.id
                }
            })
            .then(deliveries => res.status(200).send(deliveries))
            .catch(error => res.status(400).send(error))
    },
    update(req, res) {
        const responseDeliveries = deliveries.findOne({
            where: {
                id: req.params.id
            }
        });

        Promise
            .all([responseDeliveries])
            .then(responses => {
                console.log(responses)
                console.log(responseDeliveries)
                if (responses[0]) {
                    return deliveries
                        .update({
                            fullname: req.body.fullname,
                        },
                            {
                                where: {
                                    id: responses[0].dataValues.id

                                }
                            },
                        )
                        .then(delivery => res.status(200).send(delivery))
                        .catch(error => res.status(400).send(error))
                }
                else return res.sendStatus(204)
            })
    },
    delete(req, res) {
        const responseDeliveries = deliveries.findOne({
            where: {
                id: req.params.id
            }
        });

        Promise
            .all([responseDeliveries])
            .then(responses => {
                if (responses[0]) {
                    return deliveries.destroy({
                        where: {
                            id: req.params.id
                        }
                    })
                        .then(deliveries => {
                            console.log(deliveries)
                            res.status(200).send(responses[0].dataValues)
                        })
                        .catch(error => res.status(400).send(error))
                }
                else res.sendStatus(204)
            }
            )
    }
}