/**
 * @copyright Homit 2018
 */

let pub = {};

/**
 * Get user's cart based on userId
 */
pub.getUserCart = async function (userId) {
    let productUIDs = [];
    let productIds = await db.selectAllWhere(db.tables.user_cart_items, { "user_id": userId });

    if (productIds && productIds.length > 0) {
        for (let k in productIds) {
            productUIDs.push(productIds[k].depot_id);
        }
    }

    return MDB.findProducts(productUIDs);
}

/**
 * Modify products in cart
 */
pub.modifyProductInCart = async function (userId, depotId, quantity) {
    if (quantity == 0) {
        return await db.deleteQueryWithTwoCond(db.tables.user_cart_items, [{ user_id: userId }, { depot_id: depotId }]) && true;
    } else {
        let cartItem = await getCartProduct(userId, depotId);
        if (cartItem.id) {
            return await db.updateQuery(db.tables.user_cart_items, [{ quantity: quantity }, { id: cartItem.id }]) && true;
        } else {
            return await db.insertQuery(db.tables.user_cart_items, {
                user_id: userId,
                depot_id: depotId,
                quantity: quantity
            }) && true;
        }
    }
}

/**
 * Clear cart in database
 */
pub.clearCart = async function (userId) {
    return await db.deleteQuery(db.tables.user_cart_items, { user_id: userId }) && true;
}

/**
 * Return quantity based on the user id, depot id provided
 */
async function getCartProduct(userId, depotId) {
    let result = await db.selectAllWhere2(db.tables.user_cart_items, [{ user_id: userId }, { depot_id: depotId }]);

    if (result.length > 0) {
        return dbResult[0];
    }

    return false;
}

module.exports = pub;