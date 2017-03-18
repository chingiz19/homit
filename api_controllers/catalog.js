var router = require("express").Router();
var db = require("../db.js");


router.get('/beers', function(req, res, next){
    getAllBeerTypes().then(function(types){
        getAllBeers().then(function(beers) {
            var brands = getAllBrands(beers);
            var packagings = getAllPackagings(beers);
            var response = {
                success: 'true',
                types: types,
                brands: brands,
                pacakgings: packagings,
                beers: beers
            };
            res.send(response);
        });

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

var getAllBeers = function() {
    return getAllProducts(categories.Beers).then(function(beers) {
        return beers;
    });
};

var getAllWines = function() {
    return getAllProducts(categories.Wines).then(function(wines) {
        return wines;
    });
};

var getAllProducts = function(category_id) {
    var sqlQuery = `SELECT w.id AS warehouse_id, w.product_id AS product_id, t.name AS type, 
    pr.product_brand AS brand, pr.product_name AS name, 
    pr.product_description AS description, w.price AS price, 
    w.quantity AS quantity, pa.name AS packaging, c.name AS category
    FROM catalog_warehouse AS w, catalog_packagings AS pa,
    catalog_products AS pr, catalog_types AS t,
    catalog_categories AS c
    WHERE w.packaging_id = pa.id AND w.product_id = pr.id
    AND pr.type_id = t.id AND t.category_id = c.id AND ?`
    var data = {"c.id": category_id};
    return db.runQuery(sqlQuery, data).then(function(dbResult) {
        console.log(dbResult);
        return dbResult;
    })
};

var getAllBrands = function (products) {
    var result = [];
    for (i = 0; i < products.length; i++) {
        if (!result.includes(products[i].brand)) {
            result.push(products[i].brand);
        }
    }
    return result;
};

var getAllPackagings = function (products) {
    var result = [];
    for (i = 0; i < products.length; i++) {
        if (!result.includes(products[i].packaging)) {
            result.push(products[i].packaging);
        }
    }
    return result;
};


module.exports = router;