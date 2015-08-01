var Sequelize = require('sequelize');
var express = require('express');
var app = express();
var pg = require('pg');
var config = require('../../config/db.js');
// DB Setting

var sequelize = new Sequelize(config.database, config.user, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect
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