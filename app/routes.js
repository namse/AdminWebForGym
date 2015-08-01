var pg = require('pg');

// app.routes.js
module.exports = function(app, passport) {

	app.get('/', function(req, res) {
		var isLogin = req.user ? true : false;
		res.render('pages/index',{
			isLogin: isLogin
		});
	});

	app.get('/db', function (req, res) {
		console.log(process.env.DATABASE_URL);
	 	pg.connect(process.env.DATABASE_URL, function(err, client, done) {
		    client.query('SELECT * FROM test_table', function(err, result) {
		      done();
		      if (err)
		       { console.error(err); res.send("Error " + err); }
		      /*else
		       { res.render('pages/db', {results: result.rows} ); }*/
		    });
	  	});
	});

    app.get('/login', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('pages/login.ejs', { 
        	message: req.flash('loginMessage'),
        }); 
    });

    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('pages/profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

 // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.get('/logout', function(req,res){
    	if(req.user)
    		req.logout();
    	res.redirect('/');
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}