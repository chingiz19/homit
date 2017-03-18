var router = require("express").Router();
var fileSystem = require("fs");

router.route('/')
	.get(function(req, res, next){
		res.redirect(req.originalUrl + 'main');
	});

router.get('/main', function(req, res, next){
	res.render("main.ejs", {title: "Main"});
});

router.get('/catalog', function(req, res, next){
	res.render("catalog.ejs", {title: "Catalog"});
});

module.exports = router;