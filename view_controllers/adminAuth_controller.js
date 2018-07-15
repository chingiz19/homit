var router = require("express").Router();
var db = global.db;

router.get('/vieworders', Auth.validate(Auth.RolesJar.CSR), function (req, res, next) {
    req.options.ejs["title"] = "Orders";
    req.options.ejs['mode'] = process.env.n_mode;
    res.render("orders.ejs", req.options.ejs);
});

module.exports = router;