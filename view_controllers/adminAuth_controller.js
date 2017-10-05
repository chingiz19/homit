var router = require("express").Router();
var db = global.db;

router.use(function(req, res, next){
    //check logged in user in esl_database
    if (!req.session.user) next();

    var checkQuery = "SELECT first_name, last_name FROM esl_users WHERE ?";

    // db.runQuery(checkQuery, {user_email: req.cookies.user.user_email}).then(function(data){
    //     if (data.length > 0 && data[0].first_name == req.session.user.first_name && data[0].first_name == req.session.user.first_name) {
    //         next();
    //    } else {
    //         err = {
    //             status: 401,
    //             message: "Not Authorized"
    //         };
    //         next(err);
    //     }
    // });
});

router.get('/zakaz01', function(req, res, next){
    req.options.ejs["title"] = "Orders";
	res.render("admin.ejs", req.options.ejs);
});

module.exports = router;