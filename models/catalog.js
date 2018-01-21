/**
 * @copyright Homit 2018
 */

var pub = {};

pub.snackVendorSuperCategory = "snack-vendor";
pub.snackVendorDisplayName = "Snack Vendor";
pub.safewaySuperCategory = "safeway";
pub.convenienceSuperCategory = "convenience";
pub.homitCarSuperCategory = "homitcar";
pub.snackVendorImage = "snack-vendor_store.jpeg";

/**
 * Returns true if any of the stores related to the super category is open
 * 
 * @param {*String} superCategory 
 */
pub.isStoreOpen = function (superCategory) {
    var sqlQuery = `
    SELECT *

    FROM catalog_super_categories AS super_categories,
    catalog_stores AS stores
    
    WHERE super_categories.id = stores.store_type
    AND 
    (stores.open_time <= CURRENT_TIME
    AND stores.close_time >= TIME(DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 MINUTE))
    OR stores.open_time_next <= CURRENT_TIME
    AND stores.close_time_next >= TIME(DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 MINUTE))
    )
    AND ?`;

    var data = {
        "super_categories.name": superCategory
    };

    return db.runQuery(sqlQuery, data).then(function (dbResult) {
        if (dbResult.length > 0) {
            return true;
        } else {
            return false;
        }
    });
};

/* Return all products based on the category provided */
pub.getAllProductsByCategory = function (superCategory, categoryName, storeOpen) {
    var sqlQuery = `
        SELECT depot.id AS depot_id, depot.product_id AS product_id,
        listing.id AS listing_id, subcategory.name AS subcategory, type.name AS type,
        listing.product_brand AS brand, listing.product_name AS name,
        listing.product_description AS description, product.product_image AS image,
        depot.price AS price, depot.tax AS tax, depot.quantity AS quantity, packaging.name AS packaging,
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
        category.super_category_id = super_category.id
        AND ? AND ?
        
        ORDER BY listing_id, product_id, depot_id`;

    var data = [{ "category.name": categoryName }, { "super_category.name": superCategory }];
    return db.runQuery(sqlQuery, data).then(function (dbResult) {
        return getFormattedProducts(dbResult, storeOpen);
    });
};

/* Return all products based on the category provided */
pub.getCategoryOnlyProducts = function (superCategory, categoryName, storeOpen, superCategory2, categoryName2) {
    var sqlQuery = `
        SELECT depot.id AS depot_id, depot.product_id AS product_id,
        listing.id AS listing_id, subcategory.name AS subcategory, type.name AS type,
        listing.product_brand AS brand, listing.product_name AS name,
        listing.product_description AS description, product.product_image AS image,
        depot.price AS price, depot.tax AS tax, depot.quantity AS quantity, packaging.name AS packaging,
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
        category.super_category_id = super_category.id
        AND ? AND ?


        AND (listing.product_brand, listing.product_name) NOT IN (
            SELECT 
            listing2.product_brand AS brand2, listing2.product_name AS name2
            
            FROM catalog_depot AS depot2, catalog_products AS product2, catalog_listings AS listing2,
            catalog_categories AS category2, catalog_types AS type2, catalog_subcategories AS subcategory2,
            catalog_containers AS container2, catalog_packagings AS packaging2, catalog_packaging_volumes AS volume2,
            catalog_super_categories AS super_category2
            
            WHERE depot2.product_id = product2.id AND product2.listing_id = listing2.id
            AND type2.id = listing2.type_id AND type2.subcategory_id = subcategory2.id
            AND container2.id = product2.container_id AND packaging2.id = depot2.packaging_id
            AND depot2.packaging_volume_id = volume2.id AND category2.id = subcategory2.category_id AND
            category2.super_category_id = super_category2.id
            AND ? AND ?
            
        )
        
        ORDER BY listing_id, product_id, depot_id`;

    var data = [
        { "category.name": categoryName }, { "super_category.name": superCategory },
        { "category2.name": categoryName2 }, { "super_category2.name": superCategory2 }
    ];

    return db.runQuery(sqlQuery, data).then(function (dbResult) {
        return getFormattedProducts(dbResult, storeOpen);
    });
};

/* Gets all brands for the products provided */
pub.getAllBrands = function (products) {
    var result = [];
    for (i = 0; i < products.length; i++) {
        if (!result.includes(products[i].brand)) {
            result.push(products[i].brand);
        }
    }
    return result.sort();
};

/* Get all types based for the category provided */
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

/* Gets all packagings for the products provided */
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

/* Returns all available brands by provided subcateory */
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

/* Return products for front-end */
var getFormattedProducts = function (products, storeOpen) {
    var tmpResult = {};

    for (var i = 0; i < products.length; i++) {
        var product = products[i];
        var p_package = product.packaging;
        var p_volume = product.volume;

        var imageCategory = product.super_category.toLowerCase();
        if (product.super_category.toLowerCase() == Catalog.safewaySuperCategory
            || product.super_category.toLowerCase() == Catalog.convenienceSuperCategory
            || product.super_category.toLowerCase() == Catalog.homitCarSuperCategory) {
            imageCategory = Catalog.snackVendorSuperCategory;
        }

        var imageLocation = "/resources/images/products/" + imageCategory + "/" + product.category.toLowerCase() + "/";

        if (tmpResult.hasOwnProperty(product.product_id)) {
            // Adding to product variant
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
            // Adding to tmpResult
            tmpResult[product.product_id] = {
                product_id: products[i].product_id,
                listing_id: products[i].listing_id,
                subcategory: products[i].subcategory,
                type: products[i].type,
                brand: products[i].brand,
                name: products[i].name,
                super_category: product.super_category,
                description: products[i].description,
                image: imageLocation + products[i].image,
                quantity: products[i].quantity,
                container: products[i].container,
                category: products[i].category,
                tax: products[i].tax,
                product_variants: {
                    all_volumes: []
                },
                store_open: storeOpen
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

    // Converting object of objects to array of objects
    var results = [];
    for (var r in tmpResult) {
        if (tmpResult.hasOwnProperty(r)) {
            results.push(tmpResult[r]);
        }
    };
    return results;
};

pub.searchSuperCategory = function (searchText) {
    var sqlQuery = `SELECT name AS super_category, display_name AS super_category_display, image AS super_category_image FROM catalog_super_categories
    WHERE name LIKE '%` + searchText + `%' OR display_name LIKE '%` + searchText + `%'`;
    return db.runQuery(sqlQuery).then(function (dbResult) {
        return dbResult;
    });
};

pub.searchSuperCategorySpecial = function (searchText) {
    var sqlQuery = `
    SELECT name AS super_category, display_name AS super_category_display, image AS super_category_image FROM catalog_super_categories 
    WHERE name NOT IN ('` + Catalog.safewaySuperCategory + `', '` + Catalog.convenienceSuperCategory + `', '` + Catalog.homitCarSuperCategory + `')  
    AND (name LIKE '%` + searchText + `%' OR display_name LIKE '%` + searchText + `%')`;
    return db.runQuery(sqlQuery).then(function (dbResult) {
        if (Catalog.snackVendorSuperCategory.indexOf(searchText) !== -1
            || Catalog.snackVendorDisplayName.toLowerCase().indexOf(searchText) !== -1) {
            var snackVendorResult = {
                "super_category": Catalog.snackVendorSuperCategory,
                "super_category_display": Catalog.snackVendorDisplayName,
                "super_category_image": Catalog.snackVendorImage
            };
            dbResult.push(snackVendorResult);
        }
        return dbResult;
    });
};

pub.searchCategory = function (searchText) {
    var sqlQuery = `SELECT catalog_super_categories.name AS super_category, catalog_categories.name AS category,
        catalog_categories.display_name AS category_display, catalog_super_categories.display_name AS super_category_display        
        FROM catalog_categories, catalog_super_categories
        WHERE catalog_categories.super_category_id = catalog_super_categories.id
        AND (catalog_categories.name LIKE '%` + searchText + `%' OR catalog_categories.display_name LIKE '%` + searchText + `%')`;
    return db.runQuery(sqlQuery).then(function (dbResult) {
        return dbResult;
    });
};

pub.searchCategorySpecial = function (searchText) {
    var sqlQuery = `SELECT catalog_super_categories.name AS super_category, catalog_categories.name AS category,
        catalog_categories.display_name AS category_display, catalog_super_categories.display_name AS super_category_display
        FROM catalog_categories, catalog_super_categories
        WHERE catalog_categories.super_category_id = catalog_super_categories.id
        AND catalog_super_categories.name NOT IN ('` + Catalog.safewaySuperCategory + `', '` + Catalog.convenienceSuperCategory + `', '` + Catalog.homitCarSuperCategory + `')
        AND (catalog_categories.name LIKE '%` + searchText + `%' OR catalog_categories.display_name LIKE '%` + searchText + `%')        
        
        UNION
        
        SELECT DISTINCT '` + Catalog.snackVendorSuperCategory + `' AS super_category, catalog_categories.name AS category,
        catalog_categories.display_name AS category_display, '` + Catalog.snackVendorDisplayName + `' AS super_category_display
        FROM catalog_categories, catalog_super_categories
        WHERE catalog_categories.super_category_id = catalog_super_categories.id
        AND catalog_super_categories.name IN ('` + Catalog.safewaySuperCategory + `', '` + Catalog.convenienceSuperCategory + `', '` + Catalog.homitCarSuperCategory + `')
        AND (catalog_categories.name LIKE '%` + searchText + `%' OR catalog_categories.display_name LIKE '%` + searchText + `%')`;        
    return db.runQuery(sqlQuery).then(function (dbResult) {
        return dbResult;
    });
};

pub.searchSubcategory = function (searchText) {
    var sqlQuery = `SELECT catalog_super_categories.name AS super_category, catalog_categories.name AS category, catalog_subcategories.name AS subcategory  
        FROM catalog_categories, catalog_super_categories, catalog_subcategories
        WHERE catalog_categories.super_category_id = catalog_super_categories.id
        AND catalog_subcategories.category_id = catalog_categories.id
        AND catalog_subcategories.name LIKE '%` + searchText + `%'`;
    return db.runQuery(sqlQuery).then(function (dbResult) {
        return dbResult;
    });
};

pub.searchSubcategorySpecial = function (searchText) {
    var sqlQuery = `SELECT catalog_super_categories.name AS super_category, catalog_categories.name AS category, catalog_subcategories.name AS subcategory  
        FROM catalog_categories, catalog_super_categories, catalog_subcategories
        WHERE catalog_categories.super_category_id = catalog_super_categories.id
        AND catalog_subcategories.category_id = catalog_categories.id
        AND catalog_super_categories.name NOT IN ('` + Catalog.safewaySuperCategory + `', '` + Catalog.convenienceSuperCategory + `', '` + Catalog.homitCarSuperCategory + `')
        AND catalog_subcategories.name LIKE '%` + searchText + `%'
        
        UNION

        SELECT DISTINCT '`+ Catalog.snackVendorSuperCategory + `' AS super_category, catalog_categories.name AS category, catalog_subcategories.name AS subcategory  
        FROM catalog_categories, catalog_super_categories, catalog_subcategories
        WHERE catalog_categories.super_category_id = catalog_super_categories.id
        AND catalog_subcategories.category_id = catalog_categories.id
        AND catalog_super_categories.name IN ('` + Catalog.safewaySuperCategory + `', '` + Catalog.convenienceSuperCategory + `', '` + Catalog.homitCarSuperCategory + `')
        AND catalog_subcategories.name LIKE '%` + searchText + `%'
        `;
    return db.runQuery(sqlQuery).then(function (dbResult) {
        return dbResult;
    });
};

pub.searchProducts = function (searchText) {
    var sqlQuery = `SELECT product.id AS product_id, listing.id AS listing_id, subcategory.name AS subcategory,
        type.name AS type, listing.product_brand AS brand, listing.product_name AS name,
        listing.product_description AS description, product.product_image AS image,
        container.name AS container,
        category.name AS category, super_category.name AS super_category
        FROM catalog_products AS product, catalog_listings AS listing, catalog_categories AS category,
        catalog_types AS type, catalog_subcategories AS subcategory, catalog_containers AS container,
        catalog_super_categories AS super_category
        WHERE product.listing_id = listing.id AND type.id = listing.type_id AND type.subcategory_id = subcategory.id
        AND container.id = product.container_id AND category.id = subcategory.category_id AND
        category.super_category_id = super_category.id
        AND (listing.product_brand LIKE '%` + searchText + `%' OR listing.product_name LIKE '%` + searchText + `%'
        OR listing.product_description LIKE '%` + searchText + `%' OR listing.product_country LIKE '%` + searchText + `%')`;

    return db.runQuery(sqlQuery).then(function (dbResult) {
        return dbResult;
    });
};

pub.searchProductsSpecial = function (searchText) {
    var sqlQuery1 = `SELECT product.id AS product_id, listing.id AS listing_id, subcategory.name AS subcategory,
    type.name AS type, listing.product_brand AS brand, listing.product_name AS name,
    listing.product_description AS description, product.product_image AS image,
    container.name AS container,
    category.name AS category, super_category.name AS super_category
    FROM catalog_products AS product, catalog_listings AS listing, catalog_categories AS category,
    catalog_types AS type, catalog_subcategories AS subcategory, catalog_containers AS container,
    catalog_super_categories AS super_category
    WHERE product.listing_id = listing.id AND type.id = listing.type_id AND type.subcategory_id = subcategory.id
    AND container.id = product.container_id AND category.id = subcategory.category_id AND
    category.super_category_id = super_category.id
    AND super_category.name NOT IN ('` + Catalog.safewaySuperCategory + `', '` + Catalog.convenienceSuperCategory + `', '` + Catalog.homitCarSuperCategory + `')
    AND (listing.product_brand LIKE '%` + searchText + `%' OR listing.product_name LIKE '%` + searchText + `%'
    OR listing.product_description LIKE '%` + searchText + `%' OR listing.product_country LIKE '%` + searchText + `%')`;


    var sqlQuery2 = `SELECT product.id AS product_id, listing.id AS listing_id, subcategory.name AS subcategory,
    type.name AS type, listing.product_brand AS brand, listing.product_name AS name,
    listing.product_description AS description, product.product_image AS image,
    container.name AS container,
    category.name AS category, '`+ Catalog.snackVendorSuperCategory + `' AS super_category
    FROM catalog_products AS product, catalog_listings AS listing, catalog_categories AS category,
    catalog_types AS type, catalog_subcategories AS subcategory, catalog_containers AS container,
    catalog_super_categories AS super_category
    WHERE product.listing_id = listing.id AND type.id = listing.type_id AND type.subcategory_id = subcategory.id
    AND container.id = product.container_id AND category.id = subcategory.category_id AND
    category.super_category_id = super_category.id
    AND super_category.name IN ('` + Catalog.safewaySuperCategory + `', '` + Catalog.homitCarSuperCategory + `')
    AND (listing.product_brand LIKE '%` + searchText + `%' OR listing.product_name LIKE '%` + searchText + `%'
    OR listing.product_description LIKE '%` + searchText + `%' OR listing.product_country LIKE '%` + searchText + `%')`;

    var sqlQuery3 = `
    FROM catalog_products AS product, catalog_listings AS listing, catalog_categories AS category,
    catalog_types AS type, catalog_subcategories AS subcategory, catalog_containers AS container,
    catalog_super_categories AS super_category
    WHERE product.listing_id = listing.id AND type.id = listing.type_id AND type.subcategory_id = subcategory.id
    AND container.id = product.container_id AND category.id = subcategory.category_id AND
    category.super_category_id = super_category.id
    AND super_category.name = '` + Catalog.convenienceSuperCategory + `'
    AND (listing.product_brand LIKE '%` + searchText + `%' OR listing.product_name LIKE '%` + searchText + `%'
    OR listing.product_description LIKE '%` + searchText + `%' OR listing.product_country LIKE '%` + searchText + `%')`;

    return Catalog.isStoreOpen(Catalog.safewaySuperCategory).then(function (safewayOpen) {
        var sqlQuery;
        if (safewayOpen) {
            sqlQuery = sqlQuery1 + ` UNION ` + sqlQuery2;
        } else {
            sqlQuery = sqlQuery1 + ` UNION (`
                + sqlQuery2 +
                ` AND (listing.product_brand, listing.product_name) NOT IN ( SELECT listing.product_brand, listing.product_name` + sqlQuery3 + `))`
                + `
                 UNION 
            SELECT product.id AS product_id, listing.id AS listing_id, subcategory.name AS subcategory,
            type.name AS type, listing.product_brand AS brand, listing.product_name AS name,
            listing.product_description AS description, product.product_image AS image,
            container.name AS container,
            category.name AS category, '`+ Catalog.snackVendorSuperCategory + `' AS super_category` + sqlQuery3;
        }

        return db.runQuery(sqlQuery).then(function (dbResult) {
            return dbResult;
        });
    });
};

pub.searchDepotProducts = function (searchText) {
    var sqlQuery = `
        SELECT depot.id AS depot_id, depot.product_id AS product_id,
        listing.id AS listing_id, subcategory.name AS subcategory, type.name AS type,
        listing.product_brand AS brand, listing.product_name AS name,
        listing.product_description AS description, product.product_image AS image,
        depot.price AS price, depot.tax AS tax, depot.quantity AS quantity, packaging.name AS packaging,
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
        category.super_category_id = super_category.id

        AND (listing.product_brand LIKE '%` + searchText + `%' OR listing.product_name LIKE '%` + searchText + `%'
        OR listing.product_description LIKE '%` + searchText + `%' OR listing.product_country LIKE '%` + searchText + `%')`;

    return db.runQuery(sqlQuery).then(function (dbResult) {
        return dbResult;
    });
};

pub.getSuperCategoryIdByName = function (superCategory) {
    var data = { name: superCategory };
    return db.selectAllWhere(db.dbTables.catalog_super_categories, data).then(function (dbResult) {
        if (dbResult.length > 0) {
            return dbResult[0].id;
        } else {
            return false;
        }
    });
};

pub.getPricesForProducts = function (products) {
    var prices = {};
    var depotIds = [];
    for (var key in products) {
        depotIds.push(products[key].depot_id);
    }

    var sqlQuery = `
    SELECT id AS depot_id, price AS price, tax AS tax
    FROM catalog_depot
    WHERE id in (` + depotIds + `);`;

    return db.runQuery(sqlQuery).then(function (pricesList) {
        for (var i = 0; i < pricesList.length; i++) {
            var currentPrice = {
                price: pricesList[i].price,
                tax: pricesList[i].tax
            };
            prices[pricesList[i].depot_id] = currentPrice;
        }

        return prices;
    });
};

pub.getTotalPriceForProducts = function (cartProducts, dbProducts) {
    var price = Catalog.priceCalculator(cartProducts, dbProducts, false);
    return price.total_price;
};

pub.priceCalculator = function (depotQuantities, prices, refund) {
    var deliveryFee1 = 4.99;
    var deliveryFee2 = 2.99;
    var albertaGst = 0.05;
    var totalAmount = 0;
    var totalTax = 0;
    for (var i = 0; i < prices.length; i++) {
        totalAmount = totalAmount + parseFloat(prices[i].price) * depotQuantities[prices[i].depot_id];
        if (prices[i].tax) {
            totalTax = totalTax + parseFloat(prices[i].price) * depotQuantities[prices[i].depot_id] * albertaGst;
        }
    }
    // Calculating math numbers
    totalAmount = Math.round(totalAmount * 100) / 100;
    var deliveryFee = 0;
    if (!refund) {
        deliveryFee = deliveryFee1 + parseInt(totalAmount / 100) * deliveryFee2;
    }

    totalTax = Math.round((totalTax + deliveryFee * albertaGst) * 100) / 100;
    var totalPrice = totalAmount + deliveryFee + totalTax;

    // Updating display variables
    totalTax = totalTax.toFixed(2);
    totalAmount = totalAmount.toFixed(2);

    totalPrice = parseFloat(totalPrice.toFixed(2));

    var finalPrices = {
        "cart_amount": totalAmount,
        "delivery_fee": deliveryFee,
        "total_tax": totalTax,
        "total_price": totalPrice
    };

    return finalPrices;
};

pub.getCartProducts = function (cartProducts) {
    var depotIds = Object.keys(cartProducts);
    var sqlQuery = `
        SELECT depot.id AS depot_id,
        depot.price AS price, depot.tax AS tax,
        super_category.name AS super_category
        
        FROM catalog_depot AS depot, catalog_products AS product, catalog_listings AS listing,
        catalog_categories AS category, catalog_types AS type, catalog_subcategories AS subcategory,
        catalog_super_categories AS super_category
        
        WHERE depot.product_id = product.id AND product.listing_id = listing.id
        AND type.id = listing.type_id AND type.subcategory_id = subcategory.id
        AND category.id = subcategory.category_id AND
        category.super_category_id = super_category.id
        AND depot.id in (` + depotIds + `)
        
        ORDER BY super_category`;

    return db.runQuery(sqlQuery).then(function (dbResult) {
        return dbResult;
    });
};

pub.getCartProductsWithSuperCategory = function (cartProducts, dbProducts) {
    var products = {};
    var currentSuper = {};
    for (var i = 0; i < dbProducts.length; i++) {

        var currentItem = {
            depot_id: dbProducts[i].depot_id,
            price: dbProducts[i].price,
            tax: dbProducts[i].tax,
            quantity: cartProducts[dbProducts[i].depot_id]
        };

        if (i == 0) {
            currentSuper[dbProducts[i].depot_id] = currentItem;
        } else {
            if (dbProducts[i - 1].super_category != dbProducts[i].super_category) {
                products[dbProducts[i - 1].super_category] = currentSuper;
                currentSuper = {};
            }
            currentSuper[dbProducts[i].depot_id] = currentItem;
        }

        if (i == dbProducts.length - 1) {
            products[dbProducts[i].super_category] = currentSuper;
        }
    }

    return products;
};

/**
 * Custom function to do alphanumeric sort
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
