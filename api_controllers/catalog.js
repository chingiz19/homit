var router = require("express").Router();
var db = require("../db.js");


router.get('/beers', function(req, res, next){
    var response = {
        success: 'true',
        types: "all types",
        brands: "all brands",
        beers: "all beers with details"
    };
    res.send(response);
});

router.get('/wines', function(req, res, next){
    var response = {
        success: 'true',
        subcategories: "all sub categories",        
        types: "all types",
        brands: "all brands",
        wines: "all wines with details"
    };
    res.send(response);
});

module.exports = router;