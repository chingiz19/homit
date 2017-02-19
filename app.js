var express = require('express');
var webServer = express();
var path = require("path");
var webpagePath = path.join(__dirname, "/public");
var bodyParser = require("body-parser");



/* Webpage is hosted at 8080 */

webServer.use(bodyParser.json());
webServer.use(bodyParser.urlencoded({ extended: true}));
webServer.use(express.static(webpagePath));

webServer.listen(8080, function(){
	console.log("Listening at localhost:8080");
});