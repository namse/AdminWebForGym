module.exports.setup = function(app) {
	//	var app = require('../app');
	var models = app.get('models');
	var Admin = models.Admin;
	var Member = models.Member;
	var Club = models.Club;
	var InvitationToken = models.InvitationToken;
	var dbConfig = require('./db.js');
	var user = dbConfig.user;

	console.log(Admin.permission);
	models.sequelize.query("drop owned by " + user + " cascade").spread(function(result, metadata) {

		// belong
		Club.hasMany(Admin);
		Club.belongsTo(Admin, {
			as: "grandMaster",
			constraints: false
		});
		Club.hasMany(Member);
		console.log(models);

		InvitationToken.belongsTo(Club);


		models.sequelize.sync().then(function() {


			// test data

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
				console.log('dev created : ' + created);
			}).error(function(err) {
				console.log('Error occured' + err);
			});

			Admin.findOrCreate({
				where: {
					email: "grand@master.com",
				},
				defaults: {
					first_name: "grand",
					last_name: "master",
					email: "grand@master.com",
					password: Admin.generateHash("1234"),
					permission: Admin.getPermissionName("grandMaster")
				}
			}).spread(function(user, created) {
				console.log(user.dataValues);
				console.log('grand master created : ' + created);
			}).error(function(err) {
				console.log('Error occured' + err);
			});

			Admin.findOrCreate({
				where: {
					email: "manager@manager.com",
				},
				defaults: {
					first_name: "manager",
					last_name: "manager",
					email: "manager@manager.com",
					password: Admin.generateHash("1234"),
					permission: Admin.getPermissionName("manager")
				}
			}).spread(function(user, created) {
				console.log(user.dataValues);
				console.log('manager created : ' + created);
			}).error(function(err) {
				console.log('Error occured' + err);
			});


		});
	});
};