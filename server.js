/* Setup ENV variables */
var dotenv = require("dotenv");
switch (process.env.n_mode){
	case "test":
		dotenv.config({path: "test.env"});
		break;
	case "dev":
		dotenv.config({path: "dev.env"});
		break;
	case "production":
		dotenv.config({path: "production.env"});
		break;
	default:
		console.log("Missing mode (n_mode) in environment");
		process.exit(1);
}

/* Global variables */
global.express = require('express');
global.secretKey = "secretSession";
require("./model-factory").init();

/* Variables */
var session = require("express-session");
var webServer = express();
var path = require("path");
var webpagePath = path.join(__dirname, "/www");
var bodyParser = require("body-parser");
var cookies = require("cookies");
var cookieParser = require("cookie-parser");
var https = require("https");
var fs = require('fs');


/* make logs folder */
var errorLog = ".logs/error_log";
if (!fs.existsSync('.logs')){
	fs.mkdirSync('.logs');
}


/* security and other related stuff */
var helmet = require("helmet");
var csurf = require("csurf");
var limiter = require("express-rate-limit")({ // alternative - bottleneck
	windowMs: 60*1000, // every minute
	max: 500, // max 500 requests
	delayMs: 0
});

/* SLL options */
var sslOptions = {
	key: fs.readFileSync('./ssl/server.enc.key'),
	cert: fs.readFileSync('./ssl/server.crt'),
	passphrase: 'test'
}

/* Server Middleware */
webServer.use(session({
	key: "session",
	secret: secretKey,
	resave: false,
	saveUninitialized: true,
	httpOnly: false,
	cookie: {
		expires: new Date(Date.now() + (60 * 60 * 1000)),
		maxAge: 60 * 60 * 1000  // 1 hour
	}
}));


webServer.use(limiter);
webServer.use(bodyParser.json());
webServer.use(cookieParser(secretKey));
webServer.use(bodyParser.urlencoded({ extended: true }));
webServer.use(express.static(webpagePath));
webServer.set('view engine', 'ejs');

webServer.use(helmet());

webServer.use("/api/app", require(path.join(__dirname, "/api_controllers/app/app_controller")));


webServer.use(csurf());

webServer.use(function(req, res, next){
	// Set CSRF token per request
	res.cookie("csrf-token", req.csrfToken());
	res.setHeader("Keep-Alive", "timeout: 60, max: 1000");
	return next();
})


/* Redirect all HTTP to HTTPS */
webServer.all('*', function (req, res, next) {
	// if (req.secure) {
	// 	return next();
	// };

	// if (req.query.mobile) {
	// 	return next();
	// } else {
	// 	res.redirect('https://' + req.hostname + req.url); // express 4.x
	// }
	return next();
});

/* Custom modules to use for proper routing */
webServer.use("/api", require(path.join(__dirname, "/api_controllers/generic_controller")));
webServer.use("/", require(path.join(__dirname, "/view_controllers/generic_controller")));


/* 404 Path */
webServer.use(function(req, res, next){
	res.redirect("/notfound");
});

/* Error handling */
webServer.use(function(err, req, res, next){
	var message = "<date>" + new Date().toLocaleString() + "</date>\n";
	message += "\t<error path>\n\t\t" + req.path + "\n\t</error path>\n";
	message += "\t<error message>" + err.message + "\n\t</error message>\n\n";
	fs.writeFile(errorLog, message, {encoding: 'utf-8', flag: 'a'}, 
		function(err){
			if (err){
				Logger.log("-- > Error occured, but couldn't write to " + errorLog);
			}
		});
	Logger.log("[ERROR] For more information, please visit .logs/error_log file");
	if (err.code === 'EBADCSRFTOKEN'){
		res.status(403).send("Forbidden");
	} else {
		//res.status(404).send("Path not found: " + req.path);
		res.status(err.status || 500).send("<h1>Path Not Found</h1><h2>" + req.path + "</h2><h3> Status:" + 
		err.status || 500 + "</h3>");
	}
});

/* Start web server */
webServer.listen(8080, '0.0.0.0', function () {
	console.log("Listening at http://any host:8080");
});

https.createServer(sslOptions, webServer).listen(8081, function () {
	console.log("Listening at https://localhost:8081");
});