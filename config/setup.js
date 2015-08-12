module.exports.setup = function(app) {
	//	var app = require('../app');
	var models = app.get('models');
	var Admin = models.Admin;
	var dbConfig = require('./db.js');
	var user = dbConfig.user;

	console.log(Admin.permission);
	models.sequelize.query("drop owned by " + user + " cascade").spread(function(result, metadata) {
		models.sequelize.sync().then(function() {
			Admin.findOrCreate({
				where: {
					email: "skatpgusskat@naver.com",
				},
				defaults: {
					first_name: "dev",
					last_name: "admin",
					email: "skatpgusskat@naver.com",
					password: Admin.generateHash("Aa1351915"),
					permission: Admin.getPermissionName("dev")
				}
			}).spread(function(user, created) {
				console.log(user.dataValues);
				console.log('super admin created : ' + created);
			}).error(function(err) {
				console.log('Error occured' + err);
			});

			Admin.findOrCreate({
				where: {
					email: "test@test.com",
				},
				defaults: {
					first_name: "test",
					last_name: "admin",
					email: "test@test.com",
					password: Admin.generateHash("1234"),
					permission: Admin.getPermissionName("dev")
				}
			}).spread(function(user, created) {
				console.log(user.dataValues);
				console.log('super admin created : ' + created);
			}).error(function(err) {
				console.log('Error occured' + err);
			});
		});
	});
};