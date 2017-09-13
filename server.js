/* Global variables */
global.express = require('express');
global.secretKey = "secretSession";
global.modelFactory = require("./model-factory");
global.auth = require("./models/authentication");

/* Variables */
var session = require("express-session");
var webServer = express();
var path = require("path");
var webpagePath = path.join(__dirname, "/public");
var bodyParser = require("body-parser");
var cookies = require("cookies");
var cookieParser = require("cookie-parser");

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

/* Custom modules to use for proper routing */
webServer.use("/api", require(path.join(__dirname, "/api_controllers/generic_controller")));
webServer.use("/", require(path.join(__dirname, "/view_controllers/generic_controller")));

webServer.use(modelFactory.initializeServerErrorHandler());

/* Start web server */
webServer.listen(8080, function(){
	console.log("Listening at localhost:8080");
})