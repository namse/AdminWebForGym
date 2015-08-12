var pg = require('pg');
var dbConfig = require('../config/db.js');
var setupConfig = require('../config/setup.js');

// app.routes.js
module.exports = function(app, passport) {

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

	app.get('/student', isLoggedIn, function(req, res) {

	});

	app.get('/setup', function(req, res) {
		setupConfig.setup(app);
		res.send(200);
	});
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on 
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/login');
}