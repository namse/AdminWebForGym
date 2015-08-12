var Sequelize = require('sequelize');
var express = require('express');
var app = express();
var pg = require('pg');
var dbConfig = require('../../config/db.js');
// DB Setting

var sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect
});
sequelize.authenticate();

// load models
var models = [
'Member',
'Admin'
];
models.forEach(function(model) {
	module.exports[model] = sequelize.import(__dirname + '/' + model.toLowerCase());
});

module.exports.sequelize = sequelize;

/*
// describe relationships
(function(m) {
	m.PhoneNumber.belongsTo(m.User);
	m.Task.belongsTo(m.User);
	m.User.hasMany(m.Task);
	m.User.hasMany(m.PhoneNumber);
})(module.exports);
	*/