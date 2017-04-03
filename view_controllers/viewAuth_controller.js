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
	res.render("myaccount.ejs", {title: "My Acount", tabId: ""});
});

module.exports = router;