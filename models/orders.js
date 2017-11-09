/**
 * @copyright Homit 2017
 */

var pub = {};

/**
 * Creates order in orders_history table
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

    return db.insertQuery(db.dbTables.orders_history, data).then(function (inserted) {
        return inserted.insertId;
    });
};

/**
 * Inserts products
 */
pub.insertProducts = function (order_id, products) {
    for (var i = 0; i < products.length; i++) {
        var data = {
            order_id: order_id,
            depot_id: products[i].depot_id,
            quantity: products[i].quantity
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
        orders_history.id AS order_id, orders_history.date_received AS date_received, orders_history.date_delivered AS date_delivered, orders_history.delivery_address AS delivery_address, orders_history.store_id AS store_id, orders_history.driver_id AS driver_id, orders_history.order_received_name AS order_received_name, orders_history.order_received_age AS order_received_age
        FROM orders_history, users_customers as users
        WHERE orders_history.user_id = users.id AND ?
        
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
        orders_history.id AS order_id, orders_history.date_received AS date_received, orders_history.date_delivered AS date_delivered, orders_history.delivery_address AS delivery_address, orders_history.store_id AS store_id, orders_history.driver_id AS driver_id, orders_history.order_received_name AS order_received_name, orders_history.order_received_age AS order_received_age
        FROM orders_history, users_customers_guest as guests
        WHERE orders_history.guest_id = guests.id AND ?

        ORDER BY date_received`;

    var data = { "guests.id": user_id };

    return getOrdersWithQuery(sqlQuery, data);
};

function getOrdersWithQuery(sqlQuery, data) {
    return db.runQuery(sqlQuery, data).then(function (dbResult) {
        return dbResult;
    });
}

pub.getOrderById = function (orderId) {
    var sqlQuery = `
        SELECT
        orders_cart_info.depot_id AS depot_id, super_categories.name AS super_category,
        categories.name AS category, subcategories.name AS subcategory, types.name AS type,
        listings.product_brand AS brand, listings.product_name AS name,
        listings.product_description AS description, listings.product_country AS country,
        containers.name, packagings.name AS packaging, volumes.volume_name AS volume,
        depot.price AS price, products.product_image AS image, orders_cart_info.quantity AS quantity
        
        FROM orders_cart_info AS orders_cart_info, catalog_depot AS depot, catalog_products AS products,
        catalog_listings AS listings, catalog_types AS types, catalog_subcategories AS subcategories,
        catalog_categories AS categories, catalog_super_categories AS super_categories,
        catalog_packagings AS packagings, catalog_packaging_volumes AS volumes,
        catalog_containers AS containers
        
        WHERE depot.id = orders_cart_info.depot_id AND depot.product_id = products.id
        AND products.listing_id = listings.id AND listings.type_id = types.id AND
        types.subcategory_id = subcategories.id AND subcategories.category_id = categories.id
        AND categories.super_category_id = super_categories.id AND depot.packaging_id = packagings.id
        AND depot.packaging_volume_id = volumes.id AND products.container_id = containers.id
        AND ?`

    var data = { "orders_cart_info.order_id": orderId };
    return db.runQuery(sqlQuery, data).then(function (dbResult) {
        return dbResult;
    });
};

pub.getOrderByIdUserId = function (orderId, userId) {
    var sqlQuery = `
    SELECT id
    FROM orders_history
    WHERE user_id = ` + userId + ` AND ?`

    var data = { "id": orderId };
    return db.runQuery(sqlQuery, data).then(function (dbResult) {
        if (dbResult.length > 0) {
            return Orders.getOrderById(orderId);
        } else {
            return false;
        }
    });
};

pub.getUserByOrderId = function (orderId) {
    var data = {
        id: orderId
    };

    return db.selectAllWhere(db.dbTables.orders_history, data).then(function (orders) {
        if (orders.length > 0) {
            var order = orders[0];
            if (order.user_id == null) {
                return User.findGuestUserById(order.guest_id).then(function (user) {
                    return user;
                });
            } else {
                return User.findUserById(order.user_id).then(function (user) {
                    return user;
                });
            }
        } else {
            return false;
        }
    });
};

module.exports = pub;