/**
 * @copyright Homit 2018
 */

let pub = {};

/**
 * Get user's cart based on userId
 */
pub.getUserCart = async function (userId) {
    let sqlQuery = `
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
        AND ?

    
        ORDER BY depot_id;`;

    let data = { "usercart.user_id": userId };
    let dbResult = await db.runQuery(sqlQuery, [data, data]);
    if (dbResult == false) {
        return false;
    } else {
        return getFormattedProducts(dbResult);
    }
}

/**
 * Modify products in cart
 */
pub.modifyProductInCart = async function (userId, depotId, quantity) {
    if (quantity == 0) {
        let data1 = {
            user_id: userId
        };
        let data2 = {
            depot_id: depotId
        };
        let result = await db.deleteQueryWithTwoCond(db.tables.user_cart_items, [data1, data2]);
        if (result == false) {
            return false;
        } else {
            return true;
        }
    } else {
        let cartItem = await getCartProduct(userId, depotId);
        if (cartItem.id) {
            let data = {
                quantity: quantity
            };
            let key = {
                id: cartItem.id
            };
            let updated = await db.updateQuery(db.tables.user_cart_items, [data, key]);
            if (updated == false) {
                return false;
            } else {
                return true;
            }
        } else {
            let data = {
                user_id: userId,
                depot_id: depotId,
                quantity: quantity
            };
            
            return await db.insertQuery(db.tables.user_cart_items, data) && true;
        }
    }
}

/**
 * Clear cart in database
 */
pub.clearCart = async function (userId) {
    let data = {
        user_id: userId
    };
    let result = await db.deleteQuery(db.tables.user_cart_items, data);
    if (result == false) {
        return false;
    } else {
        return true;
    }
}

/**
 * Return quantity based on the user id, depot id provided
 */
var getCartProduct = async function (userId, depotId) {
    let data1 = {
        user_id: userId
    };
    let data2 = {
        depot_id: depotId
    };
    let dbResult = await db.selectAllWhere2(db.tables.user_cart_items, [data1, data2]);
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
    let tmpResult = {};
    for (let i = 0; i < products.length; i++) {
        let product = products[i];

        let imageLocation = "/resources/images/products/" + product.category.toLowerCase() + "/";
        // Adding to tmpResult
        tmpResult[product.depot_id] = {
            depot_id: product.depot_id,
            packaging: product.packaging,
            volume: product.volume,
            price: product.price,
            tax: product.tax,
            store_type_name: product.store_type,
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