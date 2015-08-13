module.exports.setup = function(app, next) {
	var models = app.get('models');
	var Admin = models.Admin;
	var Member = models.Member;
	var Club = models.Club;
	var InvitationToken = models.InvitationToken;
	var dbConfig = require('./db.js');
	var user = dbConfig.user;


	// belong
	Club.hasMany(Admin);
	Admin.belongsTo(Club);

	Club.belongsTo(Admin, {
		as: "grandMaster",
		constraints: false
	});

	Club.hasMany(Member);
	Member.belongsTo(Club);

	console.log(models);

	InvitationToken.belongsTo(Club);
	Club.hasMany(InvitationToken);


	models.sequelize.sync().then(function() {


		// test data

		Admin.findOrCreate({
			where: {
				email: "skatpgusskat@naver.com",
			},
			defaults: {
				firstName: "dev",
				lastName: "admin",
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
				firstName: "grand",
				lastName: "master",
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
				firstName: "manager",
				lastName: "manager",
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

		if (next)
			next();

	});

};

module.exports.reset = function(app) {
	var models = app.get('models');
	var dbConfig = require('./db.js');
	var user = dbConfig.user;
	models.sequelize.query("drop owned by " + user + " cascade").spread(function(result, metadata) {
		modles.sequelize.query("drop schema public cascade;
create schema public;").spread(function(result, metadata) {
			module.exports.setup(app);
		});
	});
}