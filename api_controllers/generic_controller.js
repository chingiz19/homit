var router = require("express").Router();
var path = require("path");

global.checkAuth = function(req,res,next){
    console.log("in the check auuth");
    next();
    // else res.send("not lgge in")
};

router.use("/authentication", require(path.join(__dirname, "./authentication")));

module.exports = router;