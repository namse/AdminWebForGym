var Sequelize = require('sequelize');
var express = require('express');
var app = express();
// DB Setting
var sequelize = new Sequelize('test', 'skatpgusskat', 'Aa1351915', {
	host: 'localhost',
	dialect: 'postgres',

	pool: {
		max: 5,
		min: 0,
		idle: 10000
	},
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