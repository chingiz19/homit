var router = global.express.Router();


var fileSystem = require("fs");
var errorLog = ".logs/error_log";

// make logs folder
if (!fileSystem.existsSync('.logs')){
	fileSystem.mkdirSync('.logs');
}

router.use(function(req, res, next){
	res.status(404).send("Path not found: " + req.path);
});

router.use(function(err, req, res, next){
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

module.exports = router;