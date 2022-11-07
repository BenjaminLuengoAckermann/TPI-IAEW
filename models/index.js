'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
//const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
/*
if (config.use_env_variable) {
	sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
	sequelize = new Sequelize(config.database, config.username, config.password, config);
}*/
// Option 1: Passing a connection URI
 sequelize = new Sequelize(
    'IAEW2022',
    'root',
    '123',
     {
       host: '127.0.0.1',
       dialect: 'mysql'
     })
  
  /*sequelize.authenticate().then(() => {
     console.log('Connection has been established successfully.');
  }).catch((error) => {
     console.error('Unable to connect to the database: ', error);
  });*/

fs
	.readdirSync(__dirname)
	.filter(file => {
		return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
	})
	.forEach(file => {
		const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
		db[model.name] = model;
		console.log(model.name)
	});

Object.keys(db).forEach(modelName => {
	if (db[modelName].associate) {
		db[modelName].associate(db);
	}
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;