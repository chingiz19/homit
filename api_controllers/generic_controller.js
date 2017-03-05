var router = require("express").Router();
var path = require("path");

router.use("/authentication", require(path.join(__dirname, "./authentication")));

module.exports = router;