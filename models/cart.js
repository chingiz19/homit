/**
 * @copyright Homit 2018
 */

var pub = {};

/* Get user's cart based on user_id */
pub.getUserCart = function (user_id) {
    var sqlQuery = `SELECT 
                        usercart.user_id AS user_id, usercart.quantity AS quantity,
                        depot.id AS depot_id,
                        listing.product_brand AS brand, listing.product_name AS name,
                        product.product_image AS image, category.name AS category,
                        depot.price AS price, depot.tax AS tax, depot.quantity AS depot_quantity, packaging.name AS packaging,
                        volume.volume_name AS volume, catalog_super_categories.name as super_category
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
                        AND depot.packaging_volume_id = volume.id AND category.id = subcategory.category_id AND ?
                    ORDER BY 
                        depot_id`;
    var data = { "usercart.user_id": user_id };
    return db.runQuery(sqlQuery, data).then(function (dbResult) {
        return getFormattedProducts(dbResult);
    });
};

/* Modify products in cart */
pub.modifyProductInCart = function (user_id, depot_id, quantity) {
    if (quantity == 0) {
        return getCartProduct(user_id, depot_id).then(function (cart) {
            if (cart['id'] > 0) {
                var data = {
                    id: cart['id']
                };
                db.deleteQuery(db.dbTables.user_cart_info, data).then(function (removed) {
                });
            }
        });
    } else {
        return getCartProduct(user_id, depot_id).then(function (cart) {
            if (cart['id'] > 0) {
                var data = {
                    quantity: quantity
                };
                var key = {
                    id: cart['id']
                };
                db.updateQuery(db.dbTables.user_cart_info, [data, key]).then(function (updated) {
                    return updated.id;
                });
            } else {
                var data = {
                    user_id: user_id,
                    depot_id: depot_id,
                    quantity: quantity
                };
                db.insertQuery(db.dbTables.user_cart_info, data).then(function (inserted) {
                    return inserted.id;
                });
            }
        });
    }

};

/* Clear cart in database */
pub.clearCart = function (user_id) {
    var data = {
        user_id: user_id
    };
    return db.deleteQuery(db.dbTables.user_cart_info, data).then(function (removed) {
        return removed;
    });
};


/* Return quantity based on the user id, depot id provided */
var getCartProduct = function (user_id, depot_id) {
    var sqlQuery = `
    SELECT *
    FROM user_cart_info
    WHERE user_id = `+ user_id + ` AND depot_id = ` + depot_id

    return db.runQuery(sqlQuery).then(function (dbResult) {
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
        };
    }
    return tmpResult;
}

module.exports = pub;