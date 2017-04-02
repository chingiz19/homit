var router = require("express").Router();
var fileSystem = require("fs");

router.route('/')
	.get(function(req, res, next){
		res.redirect(req.originalUrl + 'main');
	});

router.get('/main', function(req, res, next){
	res.render("main.ejs", {title: "Main", tabId: ""});
});

router.get('/catalog', function(req, res, next){
	var product = req.query.product ? req.query.product : "beers";
	var tabId = product + "Tab";
	res.render("catalog.ejs", {title: "Catalog", tabId: tabId});
});

router.get('/myaccount', function(req, res, next){
	res.render("myaccount.ejs", {title: "My Acount", tabId: ""});
});

module.exports = router;