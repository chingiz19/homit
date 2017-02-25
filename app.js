var express = require('express');
var webServer = express();
var path = require("path");
var webpagePath = path.join(__dirname, "/public");
var bodyParser = require("body-parser");
var mysql = require("mysql");

/* MySQL Connection */
var con = mysql.createConnection({
  host: "localhost",
  user: "delivery_user",
  password: "ahmadtea"
});

con.connect(function(err){
  if(err){
    console.log('Error connecting to DB');
    return;
  }
  console.log('Connection to DB established');
});

con.end(function(err) {
  // The connection is terminated gracefully
  // Ensures all previously enqueued queries are still
  // before sending a COM_QUIT packet to the MySQL server.
});


/* Webpage is hosted at 8080 */
webServer.use(bodyParser.json());
webServer.use(bodyParser.urlencoded({ extended: true}));
webServer.use(express.static(webpagePath));
webServer.set('view engine', 'ejs');

/* Custom modules to use for proper routing */
webServer.use("/", require(path.join(__dirname, "/view_controllers/generic_controller")));
//TODO: Add when we get api calls
// webServer.use("/api/", require("path to api"));

webServer.listen(8080, function(){
	console.log("Listening at localhost:8080");
});