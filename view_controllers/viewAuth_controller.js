var router = require("express").Router();


router.use(function(req, res, next){
    if (req.session && req.session.user){
        next();
    } else {
        err = {
            status: 401,
            message: "Not Authorized"
        };
        next(err);
    }
});

router.get('/myaccount', function(req, res, next){
    req.options.ejs["title"] = "My Account";
	res.render("myaccount.ejs", req.options.ejs);
});

module.exports = router;