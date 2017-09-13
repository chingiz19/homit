var router = require("express").Router();

router.get('/myaccount', auth.validate({redirect: true}), function(req, res, next){
    req.options.ejs["title"] = "My Account";
	res.render("myaccount.ejs", req.options.ejs);
});

module.exports = router;