'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class deliveries extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    };
    deliveries.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        fullname: {
            type: DataTypes.STRING,
            allowNull: false
        }, 
        isDelivering: {
            type: DataTypes.BOOLEAN, 
            defaultValue: false
        }
    }, {
        sequelize,
        modelName: 'Deliveries',
        tableName: 'deliveries', 
        timestamps: false

    });
    return deliveries;
};