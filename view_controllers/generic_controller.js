let isProduction = false;
let router = require("express").Router();

if (process.env.n_mode == "production") {
	isProduction = true;
}

let ejsOptions = {
	title: "Homit",
	catelogies: undefined,
	showSearchBar: true,
	production: isProduction,
	og_image: undefined,
	userLoggedIn: false,
	notificationBody: '',
	notificationButtonMessage: '',
	notificationHref: '',
	haveNotificationsToShow: false
};

// router.use(async function (req, res, next) {
// 	routeToNewHub(req, res, next);
// });

/**
 * Assings default options
 */
router.use(async function (req, res, next) {
	req.options = {};
	/**
	 * EJS rendering options
	 */
	req.options.ejs = Object.assign({}, ejsOptions); // deep copy

	// Check for signed in user
	let user = Auth.getSignedUser(req);
	if (user) {
		let result = await User.findUserById(user.id);
		req.options.ejs.userLoggedIn = true;
		req.options.ejs.emailVerified = result.email_verified;							//notification implementation will be moved to DB in next release
		req.options.ejs.haveNotificationsToShow = !result.email_verified;
		req.options.ejs.notificationBody = "Email verification is pending, ";
		req.options.ejs.notificationButtonMessage = "My Account";
		req.options.ejs.notificationHref = "/myaccount";
	} else {
		let coupnsToShow = await Coupon.getCoupon(Coupon.CODES.DEFAULT_SIGNUP);
		if (coupnsToShow) {
			req.options.ejs.haveNotificationsToShow = true;
			req.options.ejs.notificationBody = "Sign up to receive  ";
			req.options.ejs.notificationBody += (coupnsToShow.total_percentage_off != null) ? (coupnsToShow.total_percentage_off + "%") : ("C$" + coupnsToShow.total_price_off);
			req.options.ejs.notificationBody += " off";
		}
	}

	next();
});

router.route('/')
	.get(function (req, res, next) {
		res.redirect(req.originalUrl + 'main');
	});

router.get('/main', function (req, res, next) {
	req.options.ejs["title"] = "Homit | Italian Grocery, Snack, Liquor and Party Supply Delivery in Calgary";
	req.options.ejs["showSearchBar"] = false;
	res.render("main.ejs", req.options.ejs);
});

router.get("/checkout", function (req, res, next) {
	req.options.ejs["title"] = "Checkout";
	req.options.ejs['stripeToken'] = process.env.STRIPE_TOKEN_PUB;
	res.render("checkout.ejs", req.options.ejs);
});

router.get("/accounts", function (req, res, next) {
	req.options.ejs["title"] = "Homit - Sign in | Sign up";
	res.render("accounts.ejs", req.options.ejs);
});

router.get("/sifarish01", function (req, res, next) {
	res.render("csr_login.ejs");
});

router.get("/resetpassword/:email/:token", function (req, res, next) {
	req.options.ejs["title"] = "Reset password";
	res.render("reset_password.ejs", req.options.ejs);
});

router.get("/about", function (req, res, next) {
	req.options.ejs["title"] = "About Homit";
	req.options.ejs["showSearchBar"] = false;
	res.render("about.ejs", req.options.ejs);
});

router.get("/privacy", function (req, res, next) {
	req.options.ejs["title"] = "Homit: Privacy Policy";
	req.options.ejs["showSearchBar"] = false;
	res.render("privacy.ejs", req.options.ejs);
});

router.get("/terms-of-use", function (req, res, next) {
	req.options.ejs["title"] = "Homit: Terms of Use";
	req.options.ejs["showSearchBar"] = false;
	res.render("terms_of_use.ejs", req.options.ejs);
});

router.get("/refund", function (req, res, next) {
	req.options.ejs["title"] = "Homit: Refund Policy";
	req.options.ejs["showSearchBar"] = false;
	res.render("refund.ejs", req.options.ejs);
});

router.get("/contact", function (req, res, next) {
	req.options.ejs["title"] = "Homit: Contact Us";
	req.options.ejs["showSearchBar"] = false;
	res.render("contact.ejs", req.options.ejs);
});

router.get("/notfound", function (req, res, next) {
	req.options.ejs["title"] = "404 Not Found";
	res.status(404).render("page404.ejs", req.options.ejs);
});

router.get("/verify/:token", async function (req, res) {
	let result = JWTToken.validateToken(req.params.token);
	let name = "Dear Customer";
	let displayMessage = `Error occurred during your account verification, please go to your account and resend verification email.<br> 
	We sincerely apologize for all the inconveniences.`
	req.options.ejs["error"] = true;

	if (result) {
		let userId = result.id;
		if (result.verify_email && result.first_name && userId && result.email) {
			name = result.first_name;
			let user = await User.verifyUserAccount(userId, result.email);

			if (user) {
				req.options.ejs["error"] = false;
				req.options.ejs.emailVerified = true;
				displayMessage = "Your account has been successfully verified. Let's get rolling!";
				let couponAssigned = await Coupon.assignCouponToUser(userId, Coupon.CODES.DEFAULT_SIGNUP, 1);
				if (couponAssigned) {
					displayMessage += "<br> You just received a welcome gift. Go to My Coupons to redeem your offer.";
				}
			}
		}

		req.options.ejs["error"] = !(result && true);
		req.options.ejs["userName"] = name;
		req.options.ejs["displayMessage"] = displayMessage;
		res.render("message_generic.ejs", req.options.ejs);
	} else {
		res.redirect('/notfound');
	}
});

router.use("/hub/", require("./catalogView.js"));
router.use(require("./viewAuth_controller.js"));
router.use(require("./adminAuth_controller.js"));

// function routeToNewHub(req, res, next) {
// 	let urlArray = req.url.split("/");
// 	// if (urlArray[3] == 'chocolate-and-bar') {
// 	// 	let newUrl = "/hub/local-market/" + urlArray[2];
// 	// 	return res.redirect(newUrl);
// 	// }
// 	if (urlArray[1] == "catalog") {
// 		let newUrl = "/hub/";
// 		if (urlArray.length == 4) {
// 			newUrl += urlArray[2];
// 		} else {
// 			for (let i = 2; i < urlArray.length; i++) {
// 				newUrl += urlArray[i];
// 				if (i != urlArray.length - 1) {
// 					newUrl += "/";
// 				}
// 			}
// 		}
// 		return res.redirect(newUrl);
// 	}
// 	next();
// }

module.exports = router;