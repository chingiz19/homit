var router = require("express").Router();
var path = require("path");

router.use("/authentication", require(path.join(__dirname, "./authentication")));
router.use("/hub", require(path.join(__dirname, "./hub")));
router.use("/account", require(path.join(__dirname, "./account")));
router.use("/cart", require(path.join(__dirname, "./cart")));
router.use("/checkout", require(path.join(__dirname, "./checkout")));
router.use("/map", require(path.join(__dirname, "./map")));
router.use("/sms", Auth.validate(Auth.RolesJar.CSR), require(path.join(__dirname, "./sms")));
router.use("/csr", Auth.validate(Auth.RolesJar.CSR), require(path.join(__dirname, "./csr")));
router.use("/marketing", require(path.join(__dirname, "./marketing")));

module.exports = router;
