"use strict";
var express = require('express');
var app = express();
var pg = require('pg');
var passport = require('passport');
var flash = require('connect-flash');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var morgan = require('morgan');
var favicon = require('serve-favicon');

app.set('models', require('./app/models'));

var setupConfig = require('./config/setup.js');
// configuration ===============================================================
app.use(favicon(__dirname + '/public/favicon.ico'));
require('./config/passport')(app, passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

// required for passport
app.use(session({
	secret: 'ilovescotchscotchyscotchscotch',
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.use(express.static(__dirname + '/public'));

app.set('port', (process.env.PORT || 5000));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');




// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
setupConfig.setup(app, function() {
	app.listen(app.get('port'), function() {
		console.log('Node app is running on port', app.get('port'));
	});
});