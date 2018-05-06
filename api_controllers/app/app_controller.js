var router = require("express").Router();
var path = require("path");

router.use("/driver", require(path.join(__dirname, "./driver")));
router.use("/store", require(path.join(__dirname, "./store")));


module.exports = router;
