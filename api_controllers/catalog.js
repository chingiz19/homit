var router = require("express").Router();
var db = require("../db.js");


router.get('/beers', function(req, res, next){
    getAllBeerTypes().then(function(types){
        var response = {
            success: 'true',
            types: types,
            brands: "brands",
            pacakgings: "pacakgings",
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
    return getTypes(categories.Wines).then(function(wines) {
        return wines;
    });
};

var getTypes = function(category_id) {
    var types = "catalog_types";
    var data = {category_id: category_id};
    var result = [];
    return db.selectQuery(types, data).then(function(dbResult) {
        for (i = 0; i < dbResult.length; i++) { 
            result.push(dbResult[i].name);
        }
        return result;
    });
};

// SELECT 
// w.id AS id, 
// w.product_id AS "Product Id",
// w.price AS price,
// w.quantity AS quantity,
// pa.name AS packaging,
// pr.product_brand AS brand,
// pr.product_name AS name,
// pr.product_description AS description,
// t.name AS type,
// c.name AS category
// FROM catalog_warehouse AS w,
// catalog_packagings AS pa,
// catalog_products AS pr,
// catalog_types AS t,
// catalog_categories AS c
// WHERE 1=1
// AND w.packaging_id = pa.id
// AND w.product_id = pr.id
// AND pr.type_id = t.id
// AND t.category_id = c.id


module.exports = router;