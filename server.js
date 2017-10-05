/* Global variables */
global.express = require('express');
global.secretKey = "secretSession";
require("./model-factory").init();

/* Variables */
var session = require("express-session");
var webServer = express();
var path = require("path");
var webpagePath = path.join(__dirname, "/public");
var bodyParser = require("body-parser");
var cookies = require("cookies");
var cookieParser = require("cookie-parser");
var https = require("https");
var fs = require('fs');

/* SLL options */
var sslOptions = {
	key: fs.readFileSync('./ssl/server.enc.key'),
   	cert: fs.readFileSync('./ssl/server.crt'),
	passphrase: 'test'
}

/* Server Middleware */
webServer.use(session({
	secret: secretKey,
	resave: false,
	saveUninitialized: true,
	httpOnly: false,
	cookie: {
		expires: new Date(Date.now() + (60 * 60 *1000)),
		maxAge: 60 * 60 * 1000  // 1 hour
	}
}));

webServer.use(bodyParser.json());
webServer.use(cookieParser(secretKey));
webServer.use(bodyParser.urlencoded({ extended: true}));
webServer.use(express.static(webpagePath));
webServer.set('view engine', 'ejs');

/* Redirect all HTTP to HTTPS */
webServer.all('*', function(req, res, next){
  if(req.secure){
    return next();
  };

  if (req.query.mobile){
	  return next();
  } else {
  	res.redirect('https://' + req.hostname + req.url); // express 4.x
  }
});

/* Custom modules to use for proper routing */
webServer.use("/api", require(path.join(__dirname, "/api_controllers/generic_controller")));
webServer.use("/", require(path.join(__dirname, "/view_controllers/generic_controller")));

webServer.use(serverErrorHandler);

/* Start web server */
webServer.listen(8080, function(){
	console.log("Listening at http://localhost:8080");
});

https.createServer(sslOptions, webServer).listen(443, function(){
	console.log("Listening at https://localhost:443");
});