var express = require('express');
var webServer = express();
var path = require("path");
var webpagePath = path.join(__dirname, "/public");
var bodyParser = require("body-parser");
var db = require("./db.js");



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
	res.status(404).send("Ops...something went wrong");
});


webServer.listen(8080, function(){
	console.log("Listening at localhost:8080");
})