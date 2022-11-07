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
    delete(req, res) {
        return deliveries.destroy({
            where: {
                id: req.params.id
            }
        })
        .then(deliveries => res.sendStatus(deliveries))
        .catch(error => res.status(400).send(error))
    }
}