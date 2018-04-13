var router = require("express").Router();

router.get('/myaccount', Auth.validate({redirect: true}), function(req, res, next){
    req.options.ejs["title"] = "My Account";
    req.options.ejs['stripeToken'] = process.env.STRIPE_TOKEN_PUB;
	res.render("myaccount.ejs", req.options.ejs);
});

module.exports = router;