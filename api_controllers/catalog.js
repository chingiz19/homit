var router = require("express").Router();
var db = require("../db.js");


router.get('/beers', function(req, res, next){
    getAllBeerTypes().then(function(types){
        var response = {
            success: 'true',
            types: types,
            brands: "brands",
            beers: "all beers with details"
        };
        res.send(response);
    });
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

var categories = {
  Beers: 1,
  Wines: 2,
  Spirits: 3,
  Others: 4
};


var getAllBeerTypes = function() {
    return getTypes(categories.Beers).then(function(beers) {
        return beers;
    });
};

var getAllWinesTypes = function() {
    return getTypes(categories.Wines);
};

var getTypes = function(category_id) {
    var types = "catalog_types";
    var data = {category_id: category_id};
    var result = [];
    return db.selectQuery(types, data).then(function(dbResult) {
        for (i = 0; i < dbResult.length; i++) { 
            result[i] = dbResult[i].name;
        }
        return result;
    });
};


module.exports = router;