var pg = require('pg');
var dbConfig = require('../config/db.js');
var setupConfig = require('../config/setup.js');
// app.routes.js
module.exports = function(app, passport) {

	var models = app.get('models');
	var Member = models.Member;
	var Admin = models.Admin;
	var Club = models.Club;
	var InvitationToken = models.InvitationToken;


	app.get('/', isLoggedIn, function(req, res) {
		res.render('pages/index', {
			permission: req.user.permission
		});
	});

	app.get('/login', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('pages/login.ejs', {
			message: req.flash('loginMessage')
		});
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
		successRedirect: '/', // redirect to the secure profile section
		failureRedirect: '/login', // redirect back to the signup page if there is an error
		failureFlash: true // allow flash messages
	}));

	app.get('/logout', isLoggedIn, function(req, res) {
		if (req.user)
			req.logout();
		res.redirect('/');
	});

	app.get('/demo', function(req, res) {
		res.render('pages/demo.ejs');
	});

	app.get('/members', isLoggedIn, function(req, res) {

		var index = parseInt(req.param('index'));
		if (!index || index < 1) {
			index = 1;
		}
		var limit = 20;

		if (req.user.permission == Admin.getPermissionName("manager")) {
			var clubName = req.param('club');
			if (clubName || clubName != 'all') {
				Club.findOne({
					where: {
						name: clubName
					}
				}).then(function(club) {
					if (club) {
						Member.findAll({
							where: {
								ClubId: club.id
							},
							offset: (index - 1) * limit,
							limit: limit,
							include: [{
								model: Club
							}]
						}).then(function(members) {
							console.log(members);
							res.render('pages/members.ejs', {
								clubName: clubName,
								members: members,
								permission: req.user.permission,
								isAll: false
							});
						});
					} else {
						res.redirect('/');
					}
				});
			} else {
				Member.findAll({
					offset: (index - 1) * limit,
					limit: limit,
					include: [{
						model: Club
					}]
				}).then(function(members) {
					console.log(members);
					res.render('pages/members.ejs', {
						clubName: club.name,
						members: members,
						permission: req.user.permission,
						isAll: true
					});
				});
			}
		} else {
			req.user.getClub().then(function(club) {
				if (club) {
					Member.findAll({
						where: {
							ClubId: club.id
						},
						offset: (index - 1) * limit,
						limit: limit,
						include: [{
							model: Club
						}]
					}).then(function(members) {
						console.log(members);
						res.render('pages/members.ejs', {
							clubName: club.name,
							members: members,
							permission: req.user.permission,
							isAll: false
						});
					});
				}
			});
		}
	});

	app.get('/newMember', isLoggedIn, function(req, res) {
		var clubName = req.query.clubName;
		if (!clubName) {
			res.send(400);
			return;
		}
		if (req.user.permission != Admin.getPermissionName("manager") && req.user.permission != Admin.getPermissionName("grandMaster") && req.user.permission != Admin.getPermissionName("master")) {
			res.send(405);
			return;
		}
		Club.findOne({
			where: {
				name: clubName
			}
		}).then(function(club) {
			if (!club) {
				res.send(400);
				return;
			} else {
				res.render('pages/newMember.ejs', {
					clubName: clubName,
					permission: req.user.permission,
					message: req.flash('newMemberMessage')
				});
			}
		});
	});

	app.post('/member', isLoggedIn, function(req, res) {
		if (!req.body.clubName || !req.body.firstName || !req.body.firstName) {
			req.flash('newMemberMessage', 'Wrong Entry!');
			res.redirect('/newMember?clubName=' + req.body.clubName);
		} else {
			Club.findOne({
				where: {
					name: req.body.clubName
				}
			}).then(function(club) {
				if (!club) {
					req.flash('newMemberMessage', 'Wrong Entry!');
					res.redirect('/newMember?clubName=' + req.body.clubName);
				} else {
					Member.create({
						firstName: req.body.firstName,
						lastName: req.body.lastName
					}).then(function(member) {
						club.addMember(member).then(function() {
							member.setClub(club).then(function() {
								res.redirect('/members');
							});
						});
					});
				}
			});
		}
	});

	app.post('/club', isLoggedIn, function(req, res) {
		var name = req.body.name;
		console.log(name);
	});

	app.get('/clubs', isLoggedIn, function(req, res) {
		if (req.user.permission != Admin.getPermissionName("manager")) {
			res.send(405);
			return;
		}
		Club.findAll({
			include: [{
				model: Admin,
				as: "grandMaster"
			}]
		}).then(function(clubs) {
			console.log(clubs);
			res.render('pages/clubs.ejs', {
				clubs: clubs,
				permission: req.user.permission
			});
		});
	});

	app.get('/newClub', isLoggedIn, function(req, res) {
		if (req.user.permission != Admin.getPermissionName("manager")) {
			res.send(405);
			return;
		}
		res.render('pages/newClub.ejs', {
			message: req.flash('newClubMessage'),
			permission: req.user.permission
		});
	})

	// process the login form
	app.post('/newClub', isLoggedIn, function(req, res) {
		if (req.user.permission != Admin.getPermissionName("manager")) {
			res.send(405);
		} else if (!req.body.name || req.body.name.length <= 0 || req.body.name.length > 255) {
			req.flash('newClubMessage', 'Wrong Name.');
			res.redirect('/newClub');
		} else if (validateEmail(req.body.grandMasterEmail) == false || req.body.grandMasterEmail != req.body.grandMasterEmailVerify) {
			req.flash('newClubMessage', 'Worng Grand Master Email');
			res.redirect('/newClub');
		} else {
			Club.findOne({
				where: {
					name: req.body.name
				}
			}).then(function(club) {
				if (club)
					req.flash('newClubMessage', 'Already Club - \"' + req.body.name + "\" exists");
				else {
					Club.create({
						name: req.body.name
					}).then(function(club) {
						InvitationToken.count().then(function(count) {
							InvitationToken.create({
								permission: Admin.getPermissionName("grandMaster"),
								token: InvitationToken.generateToken(count),
								email: req.body.grandMasterEmail
							}).then(function(invitationToken) {
								invitationToken.setClub(club);
								invitationToken.save();
								//send mail
								var nodemailer = require('nodemailer');
								var urlConfig = require('../config/url');
								var smtpTransport = nodemailer.createTransport({
									service: 'Gmail',
									auth: {
										user: 'skatpgusskat@gmail.com',
										pass: 'Aa121213'
									}
								});

								var mailOptions = {
									from: 'test <manager@manager.com>',
									to: invitationToken.email,
									subject: 'Invite for Grand Master of ' + club.name,
									text: 'invite you',
									html: '<a href=\"http://' + urlConfig.web + '/invite?token=' + invitationToken.token + '\"" >link</a>'
								};

								smtpTransport.sendMail(mailOptions, function(error, response) {

									if (error) {
										console.log("error: " + error);
									} else {
										console.log("Message sent : " + response.message);
									}
									smtpTransport.close();
								});

								res.redirect('/clubs');
							});
						});
					});
				}
			});
		}
	});

	app.get('/invite', function(req, res) {
		var token = req.query.token;
		InvitationToken.findOne({
			where: {
				token: token
			},
			include: [{
				model: Club
			}]
		}).then(function(invitationToken) {
			if (!invitationToken) {
				res.send(404);
				return;
			} else if (invitationToken.expired == true) {
				res.send(400, "already used token");
			} else {
				var result = invitationToken.permission.replace(/([A-Z])/g, " $1");
				var finalResult = result.charAt(0).toUpperCase() + result.slice(1);
				var permissionName = finalResult;
				res.render('pages/invite', {
					message: req.flash('inviteMessage'),
					token: token,
					permissionName: permissionName,
					clubName: invitationToken.Club.name
				});
			}
		});
	});

	app.post('/invite', function(req, res) {
		if (!req.body.firstName || req.body.firstName.length < 1 || !req.body.lastName || req.body.lastName.length < 1 || !req.body.email || req.body.email != req.body.emailVerify || !req.body.password || req.body.password != req.body.passwordVerify) {
			req.flash('inviteMessage', 'Wrong Entry.');
			res.redirect('/invite?token=' + req.body.token);
		}
		var token = req.body.token;
		InvitationToken.findOne({
			where: {
				token: token
			},
			include: [{
				model: Club
			}]
		}).then(function(invitationToken) {
			if (!invitationToken) {
				res.send(404);
				return;
			} else if (invitationToken.expired == true) {
				res.send(400, "already used token");
			} else {
				Admin.findOne({
					where: {
						email: req.body.email
					}
				}).then(function(admin) {
					if (admin) {
						req.flash('inviteMessage', 'That Email is already used. Please Insert another Email.');
						res.redirect('/invite?token=' + req.body.token);
					} else {
						admin = Admin.build({
							firstName: req.body.firstName,
							lastName: req.body.lastName,
							email: req.body.email,
							password: Admin.generateHash(req.body.password),
							permission: invitationToken.permission
						});
						admin.save().then(function() {

							invitationToken.expired = true;
							invitationToken.Club.addAdmin(admin).then(function() {
								invitationToken.Club.setGrandMaster(admin).then(function() {
									invitationToken.Club.save().then(function() {
										admin.setClub(invitationToken.Club).then(function() {
											admin.save().then(function() {
												req.flash('loginMessage', 'Successfully Registered.');
												res.redirect('/login');
											});
										});
									});
								});
							});
						});
					}
				});
				/*
				Admin.findOrCreate({
					where: {
						email: req.body.email
					},
					defaults: {
						firstName: req.body.firstName,
						lastName: req.body.lastName,
						email: req.body.email,
						password: Admin.generateHash(req.body.password),
						permission: invitationToken.permission
					}
				}).then(function(admin, created) {
					if (created == false) {
						req.flash('inviteMessage', 'That Email is already used. Please Insert another Email.');
						res.redirect('/invite?token=' + req.body.token);
					} else {
						console.log(admin);
						//invitationToken.expired = true;
						console.log("before add admin");
						invitationToken.Club.addAdmin(admin).then(function() {
							console.log("before set gm");
							invitationToken.Club.setGrandMaster(admin).then(function() {
								console.log("before club save");
								invitationToken.Club.save().then(function() {
									console.log("before admin add club");
									admin.addClub(invitationToken.Club).then(function() {
										console.log("before admin save");
										admin.save().then(function() {
											req.flash('loginMessage', 'Successfully Registered.');
											res.redirect('/login');
										});
									});
								});
							});
						});
					}
				});*/
			}
		});
	});

	app.get('/reset', function(req, res) {
		setupConfig.reset(app);
		res.send(200);
	});

};

function validateEmail(email) {
	var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
	return re.test(email);
}
// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on 
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/login');
}