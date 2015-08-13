// config/passport.js

// load all the things we need
var LocalStrategy = require('passport-local').Strategy;



// expose this function to our app using module.exports
module.exports = function(app, passport) {

	// load up the user model
	var models = app.get('models');
	var Admin = models.Admin;

	// =========================================================================
	// passport session setup ==================================================
	// =========================================================================
	// required for persistent login sessions
	// passport needs ability to serialize and unserialize users out of session

	// used to serialize the user for the session
	passport.serializeUser(function(admin, done) {
		done(null, admin.id);
	});

	// used to deserialize the user
	passport.deserializeUser(function(id, done) {
		Admin.findById(id).then(function(admin) {
			done(null, admin);
		}).error(function(err) {
			done(err, null);
		});
	});
	// =========================================================================
	// LOCAL LOGIN =============================================================
	// =========================================================================
	// we are using named strategies since we have one for login and one for signup
	// by default, if there was no name, it would just be called 'local'

	passport.use('local-login', new LocalStrategy({
			// by default, local strategy uses username and password, we will override with email
			usernameField: 'email',
			passwordField: 'password',
			passReqToCallback: true // allows us to pass back the entire request to the callback
		},
		function(req, email, password, done) { // callback with email and password from our form

			// find a user whose email is the same as the forms email
			// we are checking to see if the user trying to login already exists
			Admin.findOne({
				where: {
					'email': email
				}
			}).then(function(admin) {
				// if no user is found, return the message
				if (!admin || !admin.validPassword(password))
					return done(null, false, req.flash('loginMessage', 'Wrong id or password.'));

				// all is well, return successful user
				return done(null, admin);
			}).error(function(err) {
				// if there are any errors, return the error before anything else
				console.log("error");
				if (err)
					return done(err);
			});

		}));

};