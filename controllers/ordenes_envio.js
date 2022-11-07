const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const ordenes_envio = require('../models').ShippingOrders;
const shipping_status = require('../models').ShippingStatus;

module.exports = {

    create(req, res) {

        const responseShippingStatus = shipping_status.findOne({
            where: {
                id: req.body.shippingStatus
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
	}
}