var router = require("express").Router();
var path = require("path");

router.use("/driver", require(path.join(__dirname, "./driver")));

module.exports = router;
