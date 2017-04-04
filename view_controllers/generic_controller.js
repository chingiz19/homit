var router = require("express").Router();

/**
 * Assings default options
 */
router.use(function(req,res,next){
	req.options = {};
	/**
	 * EJS rendering options
	 */
	req.options.ejs = {title: "DeliveryStartUp", 
						tabId: "", 
						isSignedIn: false, 
						username: ""
					};
	if (req.session && req.session.user){
		req.options.ejs["isSignedIn"] = true;
		req.options.ejs["username"] = req.session.user.first_name;
	}
	next();
});

router.route('/')
	.get(function(req, res, next){
		res.redirect(req.originalUrl + 'main');
	});

router.get('/main', function(req, res, next){
	req.options.ejs["title"] = "Main";
	res.render("main.ejs", req.options.ejs);
});

router.get('/catalog', function(req, res, next){
	var product = req.query.product ? req.query.product : "beers";
	var tabId = product + "Tab";
	req.options.ejs["title"] = "Catalog";
	req.options.ejs["tabId"] = tabId;
	res.render("catalog.ejs", req.options.ejs);
});

router.use(require("./viewAuth_controller.js"));

module.exports = router;