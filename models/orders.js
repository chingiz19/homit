/**
 * @copyright Homit 2017
 */

var pub = {};

/**
 * Creates order in orders_info table
 */
pub.createOrder = function (id, address, isGuest) {
    var data;
    if (isGuest) {
        data = {
            guest_id: id,
            delivery_address: address
        };
    } else {
        data = {
            user_id: id,
            delivery_address: address
        };
    }

    return db.insertQuery(db.dbTables.orders_info, data).then(function (inserted) {
        return inserted.insertId;
    });
};

/**
 * Inserts products
 */
pub.insertProducts = function (order_id, products) {
    for (var i = 0; i < products.length; i++) {
        var data = {
            depot_id: products[i].depot_id,
            quantity: products[i].quantity,
            order_id: order_id
        };
        return db.insertQuery(db.dbTables.orders_cart_info, data).then(function(success) {
            if (!success) {
                return false;
            }
        });
    }
    return true;    
};

module.exports = pub;