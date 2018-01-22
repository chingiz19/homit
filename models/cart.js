/**
 * @copyright Homit 2018
 */

var pub = {};

/**
 * Get user's cart based on userId
 */
pub.getUserCart = function (userId) {
    var sqlQuery = `
    SELECT
    usercart.user_id AS user_id, usercart.quantity AS quantity,
    depot.id AS depot_id,
    listing.product_brand AS brand, listing.product_name AS name,
    product.product_image AS image, category.name AS category,
    depot.price AS price, depot.tax AS tax, depot.quantity AS depot_quantity, packaging.name AS packaging,
    volume.volume_name AS volume, catalog_super_categories.name as super_category, true AS store_open
    FROM 
    catalog_depot AS depot, catalog_products AS product, catalog_listings AS listing,
    catalog_categories AS category, catalog_types AS type, catalog_subcategories AS subcategory,
    catalog_containers AS container, catalog_packagings AS packaging, catalog_packaging_volumes AS volume,
    user_cart_info AS usercart, catalog_super_categories
    WHERE 
    depot.product_id = product.id AND product.listing_id = listing.id AND depot.id = usercart.depot_id
    AND type.id = listing.type_id AND type.subcategory_id = subcategory.id
    AND container.id = product.container_id AND packaging.id = depot.packaging_id
    AND category.super_category_id = catalog_super_categories.id
    AND depot.packaging_volume_id = volume.id AND category.id = subcategory.category_id

    AND catalog_super_categories.id IN (
        SELECT DISTINCT stores.store_type
        FROM catalog_stores AS stores
        WHERE 
        (stores.open_time <= CURRENT_TIME
        AND stores.close_time >= TIME(DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 MINUTE))
        OR stores.open_time_next <= CURRENT_TIME
        AND stores.close_time_next >= TIME(DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 MINUTE))))
    AND ?

    UNION

    SELECT
    usercart.user_id AS user_id, usercart.quantity AS quantity,
    depot.id AS depot_id,
    listing.product_brand AS brand, listing.product_name AS name,
    product.product_image AS image, category.name AS category,
    depot.price AS price, depot.tax AS tax, depot.quantity AS depot_quantity, packaging.name AS packaging,
    volume.volume_name AS volume, catalog_super_categories.name as super_category, false AS store_open
    FROM 
    catalog_depot AS depot, catalog_products AS product, catalog_listings AS listing,
    catalog_categories AS category, catalog_types AS type, catalog_subcategories AS subcategory,
    catalog_containers AS container, catalog_packagings AS packaging, catalog_packaging_volumes AS volume,
    user_cart_info AS usercart, catalog_super_categories
    WHERE 
    depot.product_id = product.id AND product.listing_id = listing.id AND depot.id = usercart.depot_id
    AND type.id = listing.type_id AND type.subcategory_id = subcategory.id
    AND container.id = product.container_id AND packaging.id = depot.packaging_id
    AND category.super_category_id = catalog_super_categories.id
    AND depot.packaging_volume_id = volume.id AND category.id = subcategory.category_id

    AND catalog_super_categories.id NOT IN (
        SELECT DISTINCT stores.store_type
        FROM catalog_stores AS stores
        WHERE 
        (stores.open_time <= CURRENT_TIME
        AND stores.close_time >= TIME(DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 MINUTE))
        OR stores.open_time_next <= CURRENT_TIME
        AND stores.close_time_next >= TIME(DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 MINUTE))))
    AND ?

    ORDER BY depot_id`;
    var data1 = { "usercart.user_id": userId };
    var data2 = { "usercart.user_id": userId };
    return db.runQuery(sqlQuery, [data1, data2]).then(function (dbResult) {
        return getFormattedProducts(dbResult);
    });
};

/**
 * Modify products in cart
 */
pub.modifyProductInCart = function (userId, depotId, quantity) {
    if (quantity == 0) {
        var data1 = {
            user_id: userId
        };
        var data2 = {
            depot_id: depotId
        };
        return db.deleteQuery2(db.dbTables.user_cart_info, [data1, data2]).then(function (removed) {
            return true;
        });
    } else {
        return getCartProduct(userId, depotId).then(function (cartItem) {
            if (cartItem.id) {
                var data = {
                    quantity: quantity
                };
                var key = {
                    id: cartItem.id
                };
                return db.updateQuery(db.dbTables.user_cart_info, [data, key]).then(function (updated) {
                    return updated.id;
                });
            } else {
                var data = {
                    user_id: userId,
                    depot_id: depotId,
                    quantity: quantity
                };
                return db.insertQuery(db.dbTables.user_cart_info, data).then(function (inserted) {
                    return inserted.id;
                });
            }
        });
    }

};

/**
 * Clear cart in database
 */
pub.clearCart = function (userId) {
    var data = {
        user_id: userId
    };
    return db.deleteQuery(db.dbTables.user_cart_info, data).then(function (removed) {
        return removed;
    });
};

/**
 * Return quantity based on the user id, depot id provided
 */
var getCartProduct = function (userId, depotId) {
    var data1 = {
        user_id: userId
    };
    var data2 = {
        depot_id: depotId
    };
    return db.selectAllWhere2(db.dbTables.user_cart_info, [data1, data2]).then(function (dbResult) {
        if (dbResult.length > 0) {
            return dbResult[0];
        } else {
            return false;
        }
    });
};

/** 
 * Returns formatted products
 * @param {*} products 
 */
var getFormattedProducts = function (products) {
    var tmpResult = {};
    for (var i = 0; i < products.length; i++) {
        var product = products[i];
        var imageLocation = "/resources/images/products/" + product.super_category.toLowerCase() + "/" + product.category.toLowerCase() + "/";
        // Adding to tmpResult
        tmpResult[product.depot_id] = {
            depot_id: product.depot_id,
            packaging: product.packaging,
            volume: product.volume,
            price: product.price,
            tax: product.tax,
            super_category: product.super_category,
            brand: products[i].brand,
            name: products[i].name,
            image: imageLocation + products[i].image,
            quantity: products[i].quantity,
            store_open: products[i].store_open
        };
    }
    return tmpResult;
}

module.exports = pub;