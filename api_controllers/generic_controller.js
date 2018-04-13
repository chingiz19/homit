var router = require("express").Router();
var path = require("path");

router.use("/authentication", require(path.join(__dirname, "./authentication")));
router.use("/catalog", require(path.join(__dirname, "./catalog")));
router.use("/account", require(path.join(__dirname, "./account")));
router.use("/cart", require(path.join(__dirname, "./cart")));
router.use("/checkout", require(path.join(__dirname, "./checkout")));
router.use("/map", require(path.join(__dirname, "./map")));
router.use("/sms", require(path.join(__dirname, "./sms")));
router.use("/csr", require(path.join(__dirname, "./csr")));

module.exports = router;
