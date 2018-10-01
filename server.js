/* Setup ENV variables */
var dotenv = require("dotenv");
switch (process.env.n_mode) {
	case "test":
		dotenv.config({ path: "test.env" });
		console.log("Running in test mode \nVisit log at " + process.env.LOG_FILE_PATH);
		break;
	case "dev":
		dotenv.config({ path: "dev.env" });
		console.log("Running in development mode \nVisit log at " + process.env.LOG_FILE_PATH);
		break;
	case "production":
		dotenv.config({ path: "production.env" });
		break;
	default:
		console.log("Missing mode (n_mode) in environment");
		process.exit(1);
}

/*Building metadata for log*/
var logMeta = {
	directory: __filename
}

/* Start declaring Global variables */
global.express = require('express');
global.secretKey = "secretSession";
require("./model-factory").init();

/* Variables */
var session = require("express-session");
var webServer = express();
var path = require("path");
var webpagePath = path.join(__dirname, "/www");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var https = require("https");
var fs = require('fs');
var redisClient = require('redis').createClient();
var RedisStore = require('connect-redis')(session);

var sessionStore = new RedisStore({
	client: redisClient,
	db: db.redisTable.sessions
});

/* Global Session variable to be used by NM */
var homitSharedSessions = session({
	store: sessionStore,
	name: "session_sid",
	secret: process.env.SESSION_KEY,
	resave: true,
	saveUninitialized: false,
	cookie: {
		secure: false, // Setting to false as reverse proxy is used in production
		httpOnly: true,
		expires: new Date(Date.now() + (150 * 24 * 60 * 60 * 1000)), //150 days
		maxAge: 150 * 24 * 60 * 60 * 1000  // 150 days
	}
})

NM.setSharedSessionMiddleware(homitSharedSessions);


var cart_version = 6;
var scheduler_version = 1;

/* make logs folder */
if (!fs.existsSync('.logs')) {
	fs.mkdirSync('.logs');
}

/* Security and other related stuff */
var helmet = require("helmet");
var csurf = require("csurf");
var limiter = require("express-rate-limit")({ // alternative - bottleneck
	windowMs: 1000, // every second
	max: 200, // max 200 requests
	delayMs: 0
});

/* SLL options */
var sslOptions = {
	key: fs.readFileSync('./ssl/server.enc.key'),
	cert: fs.readFileSync('./ssl/server.crt'),
	passphrase: 'test'
};

/* Server Middleware */
webServer.use(homitSharedSessions);

// webServer.use(limiter);
webServer.use(bodyParser.json());
webServer.use(cookieParser(secretKey));
webServer.use(bodyParser.urlencoded({ extended: true }));
webServer.use(express.static(webpagePath));
webServer.set('view engine', 'ejs');

webServer.use(helmet());

webServer.use("/api/app", require(path.join(__dirname, "/api_controllers/app/app_controller")));

webServer.use(csurf());

/* Setting CSRF token, and other cookies/settings per request*/
webServer.use(function (req, res, next) {
	res.cookie("csrf-token", req.csrfToken());
	res.cookie("cart-version", cart_version, { httpOnly: false });
	res.cookie("scheduler_version", scheduler_version, { httpOnly: false });
	res.setHeader("Keep-Alive", "timeout: 60, max: 1000");
	return next();
})

/* Redirecting all HTTP to HTTPS */
webServer.all('*', function (req, res, next) {
	return next();
});

/* Custom modules to use for proper routing */
webServer.use("/api", require(path.join(__dirname, "/api_controllers/generic_controller")));
webServer.use("/", require(path.join(__dirname, "/view_controllers/generic_controller")));

/*Redirecting to 404 path */
webServer.use(function (req, res, next) {
	res.redirect("/notfound");
});

/* Error handling for web page serving portion */
webServer.use(function (err, req, res, next) {
	let message = "error path:" + req.path;
	message += ", error message:" + err.message;
	Logger.log.error(message, logMeta);

	if (err.code === 'EBADCSRFTOKEN') {
		res.status(403).send("Forbidden");
	} else {
		//res.status(404).send("Path not found: " + req.path);
		res.status(err.status || 500).send("<h1>Path Not Found</h1><h2>" + req.path + "</h2><h3> Status:" +
			err.status || 500 + "</h3>");
	}
});

/* Web server
* Set error listener
* Listen to 8080 (http) and 8081 (https)
*/
webServer.on('error', function (e) {
	Logger.log.error("Error happened during server launch. " + e.message, logMeta);
});

webServer.listen(8080, '0.0.0.0', function () {
	Logger.log.debug("Listening to http port 8080", logMeta);
});

https.createServer(sslOptions, webServer).listen(8081, function () {
	Logger.log.debug("Listening to https port 8081", logMeta);
});
