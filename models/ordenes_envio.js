'use strict';
const shipping_status = require("./shipping_status")
const {
	Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class shipping_orders extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			shipping_orders.belongsTo(models.ShippingStatus,
				{
					foreignKey: 'shippingStatus'
				}
			);
            shipping_orders.belongsTo(models.Deliveries, {
                foreignKey: "deliveryData"
            })
		}
	};
	shipping_orders.init({
        orderId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        originAddress: {
            type: DataTypes.STRING,
            allowNull: false
        },
        destinyAddress: {
            type: DataTypes.STRING,
            allowNull: false
        },
        buyerContact: {
            type: DataTypes.STRING,
            allowNull: false
        },
        shippingStatus: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        productDetail: {
            type: DataTypes.STRING,
            allowNull: false
        },
        deliveryData: {
            type: DataTypes.INTEGER,
            allowNull: true
        }, 
        deliveredAt: {
            type: DataTypes.STRING, 
            allowNull: true
        }
	}, {
		sequelize,
		modelName: 'ShippingOrders',
        tableName: 'shipping_orders', 
        timestamps: false
	});
	return shipping_orders;
};
