var express = require('express');
var webServer = express();
var path = require("path");
var webpagePath = path.join(__dirname, "/public");
var bodyParser = require("body-parser");
var db = require("./db.js");

var fileSystem = require("fs");
var errorLog = ".logs/error_log";

if (!fileSystem.existsSync('.logs')){
	fileSystem.mkdirSync('.logs');
}

/* Webpage is hosted at 8080 */
webServer.use(bodyParser.json());
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
	var message = "-- > " + req.path + "\n";
	fileSystem.writeFile(errorLog, message, {encoding: 'utf-8', flag: 'a'}, 
	function(err){
		if (err){
			console.log("-- > Error occured, but couldn't write to " + errorLog);
		}
	});
	console.log("[ERROR] For more information, please visit .logs/error_log file");
	res.status(404).send("Path not found: " + req.path);
});

webServer.listen(8080, function(){
	console.log("Listening at localhost:8080");
})