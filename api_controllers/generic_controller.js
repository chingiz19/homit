var router = require("express").Router();
var path = require("path");

// Global variables 
global.db = require("../db.js");
global.checkAuth = function(req,res,next){
    if (!req.session.user) res.status(400).send("Not allowed");
    next();
};

router.use("/authentication", require(path.join(__dirname, "./authentication")));
router.use("/catalog", require(path.join(__dirname, "./catalog")));
router.use("/myaccount", require(path.join(__dirname, "./myaccount")));
router.use("/cart", require(path.join(__dirname, "./cart")));
router.use("/orders", require(path.join(__dirname, "./orders")));

module.exports = router;