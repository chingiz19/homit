var router = require("express").Router();
var path = require("path");

router.use("/getAllProducts", require(path.join(__dirname, "./getAllProducts")));

module.exports = router;