var router = require("express").Router();
var db = global.db;

router.get('/vieworders', Auth.validateAdmin(), function (req, res, next) {
    req.options.ejs["title"] = "Orders";
    res.render("orders.ejs", req.options.ejs);
});

module.exports = router;