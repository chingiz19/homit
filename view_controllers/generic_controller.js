var isProduction = false;
if (process.env.n_mode == "production"){
	isProduction = true;
}

var router = require("express").Router();
var ejsOptions = {
	title: "Homit", 
	catelogies: undefined,
	showSearchBar: true,
	production: isProduction,
	og_image: undefined
};

/**
 * Assings default options
 */
router.use(function(req, res, next){
	req.options = {};
	/**
	 * EJS rendering options
	 */
	req.options.ejs = Object.assign({}, ejsOptions); // deep copy
	next();
});

router.route('/')
	.get(function(req, res, next){
		res.redirect(req.originalUrl + 'main');
	});

router.get('/main', function(req, res, next){
	req.options.ejs["title"] = "Homit | Snack, Liquor and Party Supply Delivery in Calgary";
	req.options.ejs["showSearchBar"] = false;
	res.render("main.ejs", req.options.ejs);
});

router.get("/checkout", function(req, res, next){
	req.options.ejs["title"] = "Checkout";
	req.options.ejs['stripeToken'] = process.env.STRIPE_TOKEN_PUB;
	res.render("checkout.ejs", req.options.ejs);
});

router.get("/sifarish01", function(req, res, next){
	res.render("csr_login.ejs");
});

router.get("/resetpassword/:email/:token", function(req, res, next){
	req.options.ejs["title"] = "Reset password";
	res.render("reset_password.ejs", req.options.ejs);
});

router.get("/about", function(req, res, next){
	req.options.ejs["title"] = "About";
	req.options.ejs["showSearchBar"] = false;
	res.render("about.ejs", req.options.ejs);
});

router.get("/privacy", function(req, res, next){
	req.options.ejs["title"] = "Privacy Policy";
	req.options.ejs["showSearchBar"] = false;
	res.render("privacy.ejs", req.options.ejs);
});

router.get("/terms-of-use", function(req, res, next){
	req.options.ejs["title"] = "Terms of Use";
	req.options.ejs["showSearchBar"] = false;
	res.render("terms_of_use.ejs", req.options.ejs);
});

router.get("/refund", function(req, res, next){
	req.options.ejs["title"] = "Refund Policy";
	req.options.ejs["showSearchBar"] = false;
	res.render("refund.ejs", req.options.ejs);
});

router.get("/contactus", function(req, res, next){
	req.options.ejs["title"] = "Contact Us";
	req.options.ejs["showSearchBar"] = false;
	res.render("contact_us.ejs", req.options.ejs);
});

router.get("/notfound", function(req, res, next){
	req.options.ejs["title"] = "404 Not Found";
	res.status(404).render("page404.ejs", req.options.ejs);
});

router.use("/catalog/", require("./catalogView.js"));
router.use(require("./viewAuth_controller.js"));
router.use(require("./adminAuth_controller.js"));

module.exports = router;