/**
 * @copyright Homit 2017
 */

var pub = {};

/**
 * Return all products based on the category provided
 */
pub.getAllProductsByCategory = function (superCategory, categoryName) {
    var sqlQuery = `
        SELECT depot.id AS depot_id, depot.product_id AS product_id,
        listing.id AS listing_id, subcategory.name AS subcategory, type.name AS type,
        listing.product_brand AS brand, listing.product_name AS name,
        listing.product_description AS description, product.product_image AS image,
        depot.price AS price, depot.quantity AS quantity, packaging.name AS packaging,
        container.name AS container, volume.volume_name AS volume, category.name AS category,
        super_category.name AS super_category
        
        FROM catalog_depot AS depot, catalog_products AS product, catalog_listings AS listing,
        catalog_categories AS category, catalog_types AS type, catalog_subcategories AS subcategory,
        catalog_containers AS container, catalog_packagings AS packaging, catalog_packaging_volumes AS volume,
        catalog_super_categories AS super_category
        
        WHERE depot.product_id = product.id AND product.listing_id = listing.id
        AND type.id = listing.type_id AND type.subcategory_id = subcategory.id
        AND container.id = product.container_id AND packaging.id = depot.packaging_id
        AND depot.packaging_volume_id = volume.id AND category.id = subcategory.category_id AND
        category.super_category_id = super_category.id AND category.name = '` + categoryName + `' AND ` +
        `super_category.name = '` + superCategory + `'
        
        ORDER BY listing_id, product_id, depot_id`;

    // var data = [{ "category.name": categoryName }, { "super_category.name": superCategory }];
    return db.runQuery(sqlQuery).then(function (dbResult) {
        if (dbResult != false) {
            return getFormattedProducts(dbResult);
        } else {
            return false;
        }
    });
};

/**
 * Gets all brands for the products provided
 */
pub.getAllBrands = function (products) {
    var result = [];
    for (i = 0; i < products.length; i++) {
        if (!result.includes(products[i].brand)) {
            result.push(products[i].brand);
        }
    }
    return result.sort();
};

/**
 * Get all types based for the category provided
 */
pub.getAllTypes = function (products) {
    var result = [];
    if (products.length <= 0) {
        return result;
    }
    var categoryName = products[0].category;
    var sqlQuery = `SELECT s.name AS subcategory, t.name AS type FROM catalog_categories AS c,
        catalog_subcategories AS s, catalog_types AS t
        WHERE s.category_id = c.id AND t.subcategory_id = s.id AND ?
        ORDER BY subcategory, t.name`;
    var data = { "c.name": categoryName };
    var prev_s;
    var tmp_types = [];
    var tmp_brands = [];
    return db.runQuery(sqlQuery, data).then(function (dbResult) {
        for (i = 0; i < dbResult.length; i++) {
            var notSame = false;
            if (i == 0) {
                prev_s = dbResult[i].subcategory;
                tmp_types.push(dbResult[i].type);
            } else {
                if (dbResult[i].subcategory == prev_s) {
                    tmp_types.push(dbResult[i].type);
                } else {
                    notSame = true;
                }
            }

            if (notSame) {
                tmp_brands = getAllBrandsBySubcategory(prev_s, products);
                var tmp = {
                    subcategory_name: prev_s,
                    types: tmp_types,
                    brands: tmp_brands
                };
                result.push(tmp);

                prev_s = dbResult[i].subcategory;
                tmp_types = [];
                tmp_types.push(dbResult[i].type);
            }

            if (i == dbResult.length - 1) {
                tmp_brands = getAllBrandsBySubcategory(prev_s, products);
                var tmp = {
                    subcategory_name: prev_s,
                    types: tmp_types,
                    brands: tmp_brands
                };
                result.push(tmp);
            }
        }
        return result;
    });
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
};

/**
 * Return products for front-end
 */
var getFormattedProducts = function (products) {
    var tmpResult = {};

    for (var i = 0; i < products.length; i++) {
        var product = products[i];
        var p_package = product.packaging;
        var p_volume = product.volume;
        var imageLocation = "/resources/images/products/" + product.super_category.toLowerCase() + "/" + product.category.toLowerCase() + "/";

        if (tmpResult.hasOwnProperty(product.product_id)) {
            // Add to product variant
            if (tmpResult[product.product_id].product_variants.hasOwnProperty(p_volume)) {
                tmpResult[product.product_id].product_variants[p_volume][p_package] = {
                    "depot_id": product.depot_id,
                    "price": product.price
                }
            } else {
                tmpResult[product.product_id].product_variants[p_volume] = {
                    all_packagings: []
                };
                tmpResult[product.product_id].product_variants[p_volume][p_package] = {
                    "depot_id": product.depot_id,
                    "price": product.price
                }
            }
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
                image: imageLocation + products[i].image,
                quantity: products[i].quantity,
                container: products[i].container,
                category: products[i].category,
                product_variants: {
                    all_volumes: []
                },
            };
            tmpResult[product.product_id].product_variants[p_volume] = {
                all_packagings: []
            };
            tmpResult[product.product_id].product_variants[p_volume][p_package] = {
                "depot_id": product.depot_id,
                "price": product.price
            }
        }

        if (!tmpResult[product.product_id].product_variants.all_volumes.includes(p_volume))
            tmpResult[product.product_id].product_variants.all_volumes.push(p_volume);
        if (!tmpResult[product.product_id].product_variants[p_volume].all_packagings.includes(p_package))
            tmpResult[product.product_id].product_variants[p_volume].all_packagings.push(p_package);
    };

    // convert object of objects to array of objects
    var results = [];
    for (var r in tmpResult) {
        if (tmpResult.hasOwnProperty(r)) {
            results.push(tmpResult[r]);
        }
    };
    return results;
};

pub.searchSuperCategory = function (searchText) {
    var sqlQuery = `SELECT name AS super_category FROM catalog_super_categories WHERE name LIKE '%` + searchText + `%'`;
    return db.runQuery(sqlQuery).then(function (dbResult) {
        if (dbResult.length > 0) {
            return dbResult;
        } else {
            return false;
        }
    });
};

pub.searchCategory = function (searchText) {
    var sqlQuery = `SELECT catalog_super_categories.name AS super_category, catalog_categories.name AS category
        FROM catalog_categories, catalog_super_categories
        WHERE catalog_categories.super_category_id = catalog_super_categories.id
        AND catalog_categories.name LIKE '%` + searchText + `%'`;
    return db.runQuery(sqlQuery).then(function (dbResult) {
        if (dbResult.length > 0) {
            return dbResult;
        } else {
            return false;
        }
    });
};

pub.searchSubcategory = function (searchText) {
    var sqlQuery = `SELECT catalog_super_categories.name AS super_category, catalog_categories.name AS category, catalog_subcategories.name AS subcategory  
        FROM catalog_categories, catalog_super_categories, catalog_subcategories
        WHERE catalog_categories.super_category_id = catalog_super_categories.id
        AND catalog_subcategories.category_id = catalog_categories.id
        AND catalog_subcategories.name LIKE '%` + searchText + `%'`;
    return db.runQuery(sqlQuery).then(function (dbResult) {
        if (dbResult.length > 0) {
            return dbResult;
        } else {
            return false;
        }
    });
};

/**
 * Custom function to do alphanumeric sort
 * 
 * Source: http://stackoverflow.com/questions/4340227/sort-mixed-alpha-numeric-array
 */
var reA = /[^a-zA-Z]/g;
var reN = /[^0-9]/g;
function sortAlphaNum(a, b) {
    var aA = a.replace(reA, "");
    var bA = b.replace(reA, "");
    if (aA === bA) {
        var aN = parseInt(a.replace(reN, ""), 10);
        var bN = parseInt(b.replace(reN, ""), 10);
        return aN === bN ? 0 : aN > bN ? 1 : -1;
    } else {
        return aA > bA ? 1 : -1;
    }
};

module.exports = pub;
