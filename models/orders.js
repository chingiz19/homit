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
        db.insertQuery(db.dbTables.orders_cart_info, data).then(function (success) {
            if (!success) {
                return false;
            }
        });
    }
    return true;
};

/**
 * Get user's order by user id 
 */
pub.getOrdersByUserId = function (user_id) {
    var sqlQuery = `
        SELECT
        orders_info.id AS order_id, orders_info.date_received AS date_received, orders_info.date_delivered AS date_delivered, orders_info.delivery_address AS delivery_address, orders_info.store_address AS store_address, orders_info.order_status AS order_status, orders_info.driver_id AS driver_id, orders_info.order_received_name AS order_received_name, orders_info.order_received_age AS order_received_age
        FROM orders_info, users_customers as users
        WHERE orders_info.user_id = users.id AND ?
        
        ORDER BY date_received`;

    var data = { "users.id": user_id };

    return getOrdersWithQuery(sqlQuery, data);
};

/**
 * Get guest user's order by guest user id 
 */
pub.getOrdersByGuestId = function (user_id) {
    var sqlQuery = `
        SELECT
        orders_info.id AS order_id, orders_info.date_received AS date_received, orders_info.date_delivered AS date_delivered, orders_info.delivery_address AS delivery_address, orders_info.store_address AS store_address, orders_info.order_status AS order_status, orders_info.driver_id AS driver_id, orders_info.order_received_name AS order_received_name, orders_info.order_received_age AS order_received_age
        FROM orders_info, users_customers_guest as guests
        WHERE orders_info.guest_id = guests.id AND ?

        ORDER BY date_received`;

    var data = { "guests.id": user_id };

    return getOrdersWithQuery(sqlQuery, data);
};

function getOrdersWithQuery(sqlQuery, data) {
    return db.runQuery(sqlQuery, data).then(function (dbResult) {
        if (dbResult != false) {
            return dbResult;
        } else {
            return false;
        }
    });
}


module.exports = pub;