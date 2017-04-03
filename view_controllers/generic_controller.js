var router = require("express").Router();

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

router.use(require("./viewAuth_controller.js"));

module.exports = router;