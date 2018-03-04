/**
 * @copyright Homit 2018
 */

var pub = {};

/**
 * Get user's cart based on userId
 */
pub.getUserCart = async function (userId) {
    var sqlQuery = `
        SELECT DISTINCT stores.store_type
        FROM catalog_stores AS stores
        WHERE 
        (stores.open_time <= CURRENT_TIME
        AND stores.close_time >= TIME(DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 MINUTE))
        OR stores.open_time_next <= CURRENT_TIME
        AND stores.close_time_next >= TIME(DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 MINUTE)))`;

    var storeTypeDb = await db.runQuery(sqlQuery);
    var openStoreTypes = [];

    for (var i = 0; i < storeTypeDb.length; i++) {
        openStoreTypes.push(storeTypeDb[i].store_type);
    }

    var sqlQuery = `
        SELECT
        usercart.quantity AS quantity,
        depot.id AS depot_id,
        listing.brand AS brand,
        listing.name AS name,
        product.image AS image,
        category.name AS category,
        depot.price AS price,
        depot.tax AS tax,
        packaging.name AS packaging,
        volume.name AS volume,
        store_type.name AS store_type,
        store_type.api_name AS store_type_api_name,
        true AS store_open

        FROM
        user_cart_items AS usercart,
        catalog_categories AS category, catalog_subcategories AS subcategory, catalog_types AS type,
        catalog_listings AS listing, catalog_products AS product, catalog_items AS item, catalog_depot AS depot,
        catalog_store_types AS store_type,
        catalog_packaging_volumes AS volume, catalog_packaging_packagings AS packaging
        
        WHERE
        usercart.depot_id = depot.id
        AND category.id = subcategory.category_id
        AND subcategory.id = type.subcategory_id
        AND type.id = listing.type_id
        AND listing.id = product.listing_id
        AND product.id = item.product_id
        AND item.id = depot.item_id
        AND item.packaging_id = packaging.id
        AND item.volume_id = volume.id
        AND depot.store_type_id = store_type.id

        AND store_type.id IN (` + openStoreTypes + `)
        AND usercart.user_id = 1

        UNION ALL

        SELECT
        usercart.quantity AS quantity,
        depot.id AS depot_id,
        listing.brand AS brand,
        listing.name AS name,
        product.image AS image,
        category.name AS category,
        depot.price AS price,
        depot.tax AS tax,
        packaging.name AS packaging,
        volume.name AS volume,
        store_type.name as store_type,
        store_type.api_name AS store_type_api_name,
        false AS store_open

        FROM
        user_cart_items AS usercart,
        catalog_categories AS category, catalog_subcategories AS subcategory, catalog_types AS type,
        catalog_listings AS listing, catalog_products AS product, catalog_items AS item, catalog_depot AS depot,
        catalog_store_types AS store_type,
        catalog_packaging_volumes AS volume, catalog_packaging_packagings AS packaging
        
        WHERE
        usercart.depot_id = depot.id
        AND category.id = subcategory.category_id
        AND subcategory.id = type.subcategory_id
        AND type.id = listing.type_id
        AND listing.id = product.listing_id
        AND product.id = item.product_id
        AND item.id = depot.item_id
        AND item.packaging_id = packaging.id
        AND item.volume_id = volume.id
        AND depot.store_type_id = store_type.id

        AND store_type.id NOT IN (` + openStoreTypes + `)
        AND usercart.user_id = 1

        ORDER BY depot_id`;

    var data1 = { "usercart.user_id": userId };
    var data2 = { "usercart.user_id": userId };
    var dbResult = await db.runQuery(sqlQuery, [data1, data2]);
    return getFormattedProducts(dbResult);
}

/**
 * Modify products in cart
 */
pub.modifyProductInCart = async function (userId, depotId, quantity) {
    if (quantity == 0) {
        var data1 = {
            user_id: userId
        };
        var data2 = {
            depot_id: depotId
        };
        await db.deleteQuery2(db.tables.user_cart_items, [data1, data2]);
        return true;
    } else {
        var cartItem = await getCartProduct(userId, depotId);
        if (cartItem.id) {
            var data = {
                quantity: quantity
            };
            var key = {
                id: cartItem.id
            };
            var updated = await db.updateQuery(db.tables.user_cart_items, [data, key]);
            return updated.id;
        } else {
            var data = {
                user_id: userId,
                depot_id: depotId,
                quantity: quantity
            };
            var inserted = await db.insertQuery(db.tables.user_cart_items, data);
            return inserted.id;
        }
    }
}

/**
 * Clear cart in database
 */
pub.clearCart = async function (userId) {
    var data = {
        user_id: userId
    };
    await db.deleteQuery(db.tables.user_cart_items, data);
}

/**
 * Return quantity based on the user id, depot id provided
 */
var getCartProduct = async function (userId, depotId) {
    var data1 = {
        user_id: userId
    };
    var data2 = {
        depot_id: depotId
    };
    var dbResult = await db.selectAllWhere2(db.tables.user_cart_items, [data1, data2]);
    if (dbResult.length > 0) {
        return dbResult[0];
    } else {
        return false;
    }
}

/** 
 * Returns formatted products
 * 
 * @param {*} products 
 */
var getFormattedProducts = function (products) {
    var tmpResult = {};
    for (var i = 0; i < products.length; i++) {
        var product = products[i];

        var imageLocation = "/resources/images/products/" + product.category.toLowerCase() + "/";
        // Adding to tmpResult
        tmpResult[product.depot_id] = {
            depot_id: product.depot_id,
            packaging: product.packaging,
            volume: product.volume,
            price: product.price,
            tax: product.tax,
            store_type_api_name: product.store_type_api_name,
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