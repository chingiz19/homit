var router = require("express").Router();

/**
 * Assings default options
 */
router.use(function(req,res,next){
	req.options = {};
	/**
	 * EJS rendering options
	 */
	req.options.ejs = {title: "Homit", 
						catelogies: undefined,
						showSearchBar: true
					};
	next();
});

router.route('/')
	.get(function(req, res, next){
		res.redirect(req.originalUrl + 'main');
	});

router.get('/main', function(req, res, next){
	req.options.ejs["title"] = "Main";
	req.options.ejs["showSearchBar"] = false;
	res.render("main.ejs", req.options.ejs);
});

router.get("/checkout", function(req, res, next){
	req.options.ejs["title"] = "Checkout";
	res.render("checkout.ejs", req.options.ejs);
});

router.get("/sifarish01", function(req, res, next){
	res.render("csr_login.ejs");
});

router.get("/notfound", function(req, res, next){
	req.options.ejs["title"] = "404 Not Found";
	req.options.ejs["showSearchBar"] = false;
	res.status(404).render("page404.ejs", req.options.ejs);
});

router.use("/catalog/", require("./catalogView.js"));
router.use(require("./viewAuth_controller.js"));
router.use(require("./adminAuth_controller.js"));

module.exports = router;