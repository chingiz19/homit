var express = require('express');
var session = require("express-session");
var webServer = express();
var path = require("path");
var webpagePath = path.join(__dirname, "/public");
var bodyParser = require("body-parser");
var db = require("./db.js");
var cookies = require("cookies");
var cookieParser = require("cookie-parser");
const secretKey = "secretSession";

var fileSystem = require("fs");
var errorLog = ".logs/error_log";

if (!fileSystem.existsSync('.logs')){
	fileSystem.mkdirSync('.logs');
}

/* Webpage is hosted at 8080 */
webServer.use(session({
	secret: secretKey,
	resave: false,
	saveUninitialized: true,
	httpOnly: false,
	cookie: {maxAge: 5 * 60 * 1000} // 5 mins
}));

webServer.use(bodyParser.json());
webServer.use(cookieParser());
webServer.use(bodyParser.urlencoded({ extended: true}));
webServer.use(express.static(webpagePath));
webServer.set('view engine', 'ejs');

/* Custom modules to use for proper routing */
webServer.use("/api", require(path.join(__dirname, "/api_controllers/generic_controller")));
webServer.use("/", require(path.join(__dirname, "/view_controllers/generic_controller")));
//TODO: Add when we get api calls
// webServer.use("/api/", require("path to api"));

webServer.use(function(req, res, next){
	res.status(404).send("Path not found: " + req.path);
});

webServer.use(function(err, req, res, next){
	var message = "<date>" + new Date().toLocaleString() + "</date>\n";
	message += "\t<error path>\n\t\t" + req.path + "\n\t</error path>\n";
	message += "\t<error message>" + err.message + "\n\t</error message>\n\n";
	fileSystem.writeFile(errorLog, message, {encoding: 'utf-8', flag: 'a'}, 
	function(err){
		if (err){
			console.log("-- > Error occured, but couldn't write to " + errorLog);
		}
	});
	console.log("[ERROR] For more information, please visit .logs/error_log file");
	//res.status(404).send("Path not found: " + req.path);
	res.status(err.status || 500).send("<h1>Path Not Found</h1><h2>" + req.path + "</h2><h3> Status:" + 
	err.status || 500 + "</h3>");
});

webServer.listen(8080, function(){
	console.log("Listening at localhost:8080");
})