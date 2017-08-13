var router = require("express").Router();

/**
 * List of categories with their ids
 */
var categories = {
  Beers: 1,
  Wines: 2,
  Spirits: 3,
  Others: 4
};

router.get('/beers', function(req, res, next){
    getAllBeers().then(function(products) {
        var formattedProducts = getFormattedProducts(products);
        getAllBeerTypes(products).then(function(subcategories){
            var response = {
                success: 'true',
                subcategories: subcategories,
                products: formattedProducts
            };
            res.send(response);
        });
    });
});

router.get('/wines', function(req, res, next){
    getAllWines().then(function(products) {
        var formattedProducts = getFormattedProducts(products);        
        getAllWineTypes(products).then(function(subcategories){
            var response = {
                success: 'true',
                subcategories: subcategories,
                products: formattedProducts
            };
            res.send(response);
        });
    });
});

router.get('/spirits', function(req, res, next){
    getAllSpirits().then(function(products) {
        var formattedProducts = getFormattedProducts(products);        
        getAllSpiritTypes(products).then(function(subcategories){            
            var response = {
                success: 'true',
                subcategories: subcategories,
                products: formattedProducts
            };
            res.send(response);
        });
    });
});

router.get('/others', function(req, res, next){
    getAllOthers().then(function(products) {
        var formattedProducts = getFormattedProducts(products);        
        getAllOtherTypes(products).then(function(subcategories){            
            var response = {
                success: 'true',
                subcategories: subcategories,
                products: formattedProducts
            };
            res.send(response);
        });
    });
});

/**
 * Gets all types for beers
 */
var getAllBeerTypes = function(products) {
    return getTypes(categories.Beers, products).then(function(beers) {
        return beers;
    });
};

/**
 * Gets all types for wines
 */
var getAllWineTypes = function(products) {
    return getTypes(categories.Wines, products).then(function(wines) {
        return wines;
    });
};

/**
 * Gets all types for spirits
 */
var getAllSpiritTypes = function(products) {
    return getTypes(categories.Spirits, products).then(function(spirits) {
        return spirits;
    });
};

/**
 * Gets all types for others
 */
var getAllOtherTypes = function(products) {
    return getTypes(categories.Others, products).then(function(others) {
        return others;
    });
};

/**
 * Get all types based for the category provided
 */
var getTypes = function(category_id, products) {
    var sqlQuery = `SELECT s.name AS subcategory, t.name AS type FROM catalog_categories AS c,
        catalog_subcategories AS s, catalog_types AS t
        WHERE s.category_id = c.id AND t.subcategory_id = s.id AND ?
        ORDER BY subcategory, t.name`;
    var result = [];
    var data = {"c.id": category_id};
    var prev_s;
    var tmp_types = [];
    var tmp_brands = [];
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
                tmp_brands = getAllBrandsBySubcategory(prev_s, products);
                var tmp = {
                    subcategory_name: prev_s,
                    types: tmp_types,
                    brands: tmp_brands
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

/**
 * Return all beers
 */
var getAllBeers = function() {
    return getAllProducts(categories.Beers).then(function(beers) {
        return beers;
    });
};

/**
 * Return all wines
 */
var getAllWines = function() {
    return getAllProducts(categories.Wines).then(function(wines) {
        return wines;
    });
};

/**
 * Return all spirits
 */
var getAllSpirits = function() {
    return getAllProducts(categories.Spirits).then(function(spirits) {
        return spirits;
    });
};

/**
 * Return all others
 */
var getAllOthers = function() {
    return getAllProducts(categories.Others).then(function(others) {
        return others;
    });
};

/**
 * Return all products based on the category provided
 */
var getAllProducts = function(category_id) {
    var sqlQuery = `SELECT depot.id AS depot_id, depot.product_id AS product_id,
        listing.id AS listing_id, subcategory.name AS subcategory, type.name AS type,
        listing.product_brand AS brand, listing.product_name AS name,
        listing.product_description AS description, product.product_image AS image,
        depot.price AS price, depot.quantity AS quantity, packaging.name AS packaging,
        container.name AS container, volume.volume_name AS volume, category.name AS category
        FROM catalog_depot AS depot, catalog_products AS product, catalog_listings AS listing,
        catalog_categories AS category, catalog_types AS type, catalog_subcategories AS subcategory,
        catalog_containers AS container, catalog_packagings AS packaging, catalog_packaging_volumes AS volume
        WHERE depot.product_id = product.id AND product.listing_id = listing.id
        AND type.id = listing.type_id AND type.subcategory_id = subcategory.id
        AND container.id = product.container_id AND packaging.id = depot.packaging_id
        AND depot.packaging_volume_id = volume.id AND category.id = subcategory.category_id AND ?
        ORDER BY listing_id, product_id, depot_id`;
    var data = {"category.id": category_id};
    return db.runQuery(sqlQuery, data).then(function(dbResult) {
        return dbResult;
    });
};

/**
 * Gets all brands for the products provided
 */
var getAllBrands = function (products, subcategories) {
    var result = [];
    var tmp_brands = [];
    // for (i = 0; i < subcategories.length; i++) {

    // }
    for (i = 0; i < products.length; i++) {
        if (!result.includes(products[i].brand)) {
            result.push(products[i].brand);
        }
    }
    return result.sort();
};

/**
 * Gets all packagings for the products provided
 */
var getAllPackagings = function (products) {
    var result = [];
    if (typeof products != 'undefined') {
        for (i = 0; i < products.length; i++) {
            if (!result.includes(products[i].packaging)) {
                result.push(products[i].packaging);
            }
        }
    }
    return result.sort(sortAlphaNum);
};

/**
 * Returns all available brands by provided subcateory
 */
var getAllBrandsBySubcategory = function (subcategory, products) {
    var result = [];
    if (typeof products != 'undefined') {
        for (j = 0; j < products.length; j++) {
            if (products[j].subcategory == subcategory) {
                if (!result.includes(products[j].brand)) {
                    result.push(products[j].brand);
                }
            }
        }
    }
    return result.sort();
}

/**
 * Return products for front-end
 */
var getFormattedProducts = function (products) {
    var tmpResult = {};

    for (var i=0; i < products.length; i++){
        var product = products[i];
        var imageLocation = "/resources/images/products/"+product.category.toLowerCase()+"/";
        if (tmpResult.hasOwnProperty(product.product_id)){
            // Add to product variant
            tmpResult[product.product_id].product_variants.push({
                "depot_id": product.depot_id,
                "packaging": product.packaging,
                "volume": product.volume,
                "price": product.price
            });
        } else {
            // Add to tmpResult
            tmpResult[product.product_id] = {
                product_id: products[i].product_id,
                listing_id: products[i].listing_id,
                subcategory: products[i].subcategory,
                type: products[i].type,
                brand: products[i].brand,
                name: products[i].name,
                description: products[i].description,
                image: imageLocation+products[i].image,
                quantity: products[i].quantity,
                container: products[i].container,
                category: products[i].category,
                product_variants: [{
                    "depot_id": product.depot_id,
                    "packaging": product.packaging,
                    "volume": product.volume,
                    "price": product.price
                }]
            };
        }
    };

    // convert object of objects to array of objects
    var results = [];
    for (var r in tmpResult){
        if (tmpResult.hasOwnProperty(r)){
            results.push(tmpResult[r]);
        }
    };
    return results;
}

/**
 * Custom function to do alphanumeric sort
 * 
 * Source: http://stackoverflow.com/questions/4340227/sort-mixed-alpha-numeric-array
 */
var reA = /[^a-zA-Z]/g;
var reN = /[^0-9]/g;
function sortAlphaNum(a,b) {
    var aA = a.replace(reA, "");
    var bA = b.replace(reA, "");
    if(aA === bA) {
        var aN = parseInt(a.replace(reN, ""), 10);
        var bN = parseInt(b.replace(reN, ""), 10);
        return aN === bN ? 0 : aN > bN ? 1 : -1;
    } else {
        return aA > bA ? 1 : -1;
    }
}


module.exports = router;