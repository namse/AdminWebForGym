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
			message: req.flash('loginMessage'),
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
		//    param
		//      club
		//      index : 1 ~ n
		var limit = 20;
		var condition = {
			offset: (ineex - 1) * limit,
			limit: limit
		};
		if (req.param('club') == 'all') {
			if (req.user.permission != Admin.getPermissionName("manager")) {
				res.send(405);
				return;
			}
		} else {
			var club = Club.findOne({
				where: {
					name: req.param('club')
				}
			});
			if (!club) {
				res.send(404);
				return;
			} else {
				console.log("id : " + req.user.ClubId + " / " + club.id);
				if (req.user.permission != Admin.getPermissionName("manager") && req.user.ClubId != club.id) {
					res.send(404);
					return;
				}
			}

			condition['ClubId'] = club.id;
		}
		Member.findAll({
			where: condition
		}).spread(function(members) {
			res.render('pages/member.ejs', {
				members: members
			});
		});
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
		Club.findAll().then(function(clubs) {
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
		} else if (validateEmail(req.body.grandMasterEmail) == false || req.body.grandMasterEmail != req.body.grandMasterEmailAgain) {
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


	app.get('/setup', function(req, res) {
		setupConfig.setup(app);
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