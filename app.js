var express = require('express');
var webServer = express();
var path = require("path");
var webpagePath = path.join(__dirname, "/public");
var bodyParser = require("body-parser");
var fileSystem = require("fs");
var ejs = require("EJS");



/* Webpage is hosted at 8080 */

webServer.use(bodyParser.json());
webServer.use(bodyParser.urlencoded({ extended: true}));
webServer.use(express.static(webpagePath));

webServer.set('view engine', 'ejs');


webServer.get('/', function(req, res){
	sendFile("public/view/main.html", res, {title: "Main Page"});
});

function sendFile(file, res, headerOptions, footerOptions){
	fileSystem.readFile(file, function(err, body){
		var header = ejs.render(fileSystem.readFileSync('public/partial/header.ejs', 'utf-8'), headerOptions);
		var footer = ejs.render(fileSystem.readFileSync('public/partial/footer.ejs', 'utf-8'), footerOptions);
		var html = header + body + footer;
		res.send(html);
	});
}

webServer.listen(8080, function(){
	console.log("Listening at localhost:8080");
});