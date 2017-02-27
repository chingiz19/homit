var router = require("express").Router();

// router.use("/getAllProducts", require(path.join(__dirname, "/api_controllers/getAllProducts")));

router.get('/beers', function(req, res, next){
	res.send("in the get beers");
});

router.get('/wines', function(req, res, next){
    res.send("in the get wines");
});


module.exports = router;