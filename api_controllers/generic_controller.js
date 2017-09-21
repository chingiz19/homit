var router = require("express").Router();
var path = require("path");

// Global variables 
global.db = global.modelFactory.initializeDatabase();

router.use("/authentication", require(path.join(__dirname, "./authentication")));
router.use("/catalog", require(path.join(__dirname, "./catalog")));
router.use("/myaccount", require(path.join(__dirname, "./myaccount")));
router.use("/cart", require(path.join(__dirname, "./cart")));
router.use("/orders", require(path.join(__dirname, "./orders")));
router.use("/checkout", require(path.join(__dirname, "./checkout")));

module.exports = router;