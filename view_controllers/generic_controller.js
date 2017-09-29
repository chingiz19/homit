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
						tabId: "", 
						isSignedIn: false, 
						username: "",
						catelogies: undefined
					};
	if (req.session && req.cookies.user){
		req.options.ejs["isSignedIn"] = true;
		req.options.ejs["username"] = req.cookies.user.first_name;
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

router.get("/checkout", function(req, res, next){
	req.options.ejs["title"] = "Checkout";
	res.render("checkout.ejs", req.options.ejs);
});

router.get("/admin", function(req, res, next){
	req.options.ejs["title"] = "Admin";
	res.render("admin.ejs", req.options.ejs);
});

router.use("/catalog/", require("./catalogView.js"));
router.use(require("./viewAuth_controller.js"));
router.use(require("./adminAuth_controller.js"));

module.exports = router;