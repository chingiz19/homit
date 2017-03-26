var router = require("express").Router();
var db = require("../db.js");


router.get('/beers', function(req, res, next){
    getAllBeerTypes().then(function(subcategories){
        getAllBeers().then(function(products) {
            var brands = getAllBrands(products);
            var packagings = getAllPackagings(products);
            var response = {
                success: 'true',
                subcategories: subcategories,
                brands: brands,
                packagings: packagings,
                products: products
            };
            res.send(response);
        });

    });
});

router.get('/wines', function(req, res, next){
    getAllWineTypes().then(function(subcategories){
        getAllWines().then(function(products) {
            var brands = getAllBrands(products);
            var packagings = getAllPackagings(products);
            var response = {
                success: 'true',
                subcategories: subcategories,
                brands: brands,
                packagings: packagings,
                products: products
            };
            res.send(response);
        });
    });
});

router.get('/spirits', function(req, res, next){
    getAllSpiritTypes().then(function(subcategories){
        getAllSpirits().then(function(products) {
            var brands = getAllBrands(products);
            var packagings = getAllPackagings(products);
            var response = {
                success: 'true',
                subcategories: subcategories,
                brands: brands,
                packagings: packagings,
                products: products
            };
            res.send(response);
        });
    });
});

router.get('/others', function(req, res, next){
    getAllOtherTypes().then(function(subcategories){
        getAllOthers().then(function(products) {
            var brands = getAllBrands(products);
            var packagings = getAllPackagings(products);
            var response = {
                success: 'true',
                subcategories: subcategories,
                brands: brands,
                packagings: packagings,
                products: products
            };
            res.send(response);
        });
    });
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

var getAllWineTypes = function() {
    return getTypes(categories.Wines).then(function(wines) {
        return wines;
    });
};

var getAllSpiritTypes = function() {
    return getTypes(categories.Spirits).then(function(spirits) {
        return spirits;
    });
};

var getAllOtherTypes = function() {
    return getTypes(categories.Others).then(function(others) {
        return others;
    });
};

var getTypes = function(category_id) {
    var sqlQuery = `SELECT s.name AS subcategory, t.name AS type FROM catalog_categories AS c,
        catalog_subcategories AS s, catalog_types AS t
        WHERE s.category_id = c.id AND t.subcategory_id = s.id AND ?
        ORDER BY subcategory`;
    var result = [];
    var data = {"c.id": category_id};
    var prev_s;
    var tmp_types = [];
    return db.runQuery(sqlQuery, data).then(function(dbResult) {
        for (i = 0; i < dbResult.length; i++) {
            var canPush = false;
            if (i==0) {
                prev_s = dbResult[i].subcategory;
                tmp_types.push(dbResult[i].type);
            } else {
                if (dbResult[i].subcategory == prev_s) {
                    tmp_types.push(dbResult[i].type);
                } else {
                    canPush = true;
                }
            }

            if (canPush || i == dbResult.length-1) {
                var tmp = {
                    subcategory_name: prev_s,
                    types: tmp_types
                };
                prev_s = dbResult[i].subcategory;
                tmp_types = [];
                tmp_types.push(dbResult[i].type);
                result.push(tmp);
            }
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

var getAllSpirits = function() {
    return getAllProducts(categories.Spirits).then(function(spirits) {
        return spirits;
    });
};

var getAllOthers = function() {
    return getAllProducts(categories.Others).then(function(others) {
        return others;
    });
};

var getAllProducts = function(category_id) {
    var sqlQuery = `SELECT w.id AS warehouse_id, w.product_id AS product_id, s.name AS subcategory, 
        t.name AS type, pr.product_brand AS brand, pr.product_name AS name, pr.product_description AS description,
        w.price AS price, w.quantity AS quantity, pa.name AS packaging, c.name AS category
        FROM catalog_warehouse AS w, catalog_packagings AS pa, catalog_products AS pr, catalog_types AS t,
        catalog_subcategories AS s, catalog_categories AS c
        WHERE w.packaging_id = pa.id AND w.product_id = pr.id AND pr.type_id = t.id
        AND t.subcategory_id = s.id AND s.category_id = c.id AND ?`;
    var data = {"c.id": category_id};
    return db.runQuery(sqlQuery, data).then(function(dbResult) {
        return dbResult;
    });
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