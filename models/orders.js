/**
 * @copyright Homit 2018
 */

var pub = {};

/**
 * Create transaction order in orders_transactions_history table
 * 
 * @param {*} userId 
 * @param {*} address 
 * @param {*} address_lat 
 * @param {*} address_long 
 * @param {*} driverInstruction 
 * @param {*} phoneNumber 
 * @param {*} isGuest 
 * @param {*} transactionId 
 * @param {*} cardNumber 
 * @param {*} allPrices 
 */
pub.createTransactionOrder = async function (userId, address, address_lat, address_long, driverInstruction, phoneNumber, isGuest, chargeId, cardNumber, allPrices) {
    var data = {
        delivery_address: address,
        delivery_latitude: address_lat,
        delivery_longitude: address_long,
        charge_id: chargeId,
        card_digits: cardNumber,
        total_price: allPrices.total_price,
        total_amount: allPrices.cart_amount,
        delivery_fee: allPrices.delivery_fee,
        total_tax: allPrices.total_tax,
        phone_number: phoneNumber
    };
    if (isGuest) {
        data.guest_id = userId;
    } else {
        data.user_id = userId;
    }

    if (driverInstruction) {
        data.driver_instruction = driverInstruction;
    };

    var inserted = await db.insertQuery(db.tables.orders_transactions_history, data);
    return inserted.insertId;
}

/**
 * Create order in orders_history table
 * 
 * @param {*} orderTransactionId 
 * @param {*} storeType 
 */
pub.createOrder = async function (orderTransactionId, storeType, prices) {
    var storeType = await Catalog.getStoreTypeIdByName(storeType);
    var data = {
        order_transaction_id: orderTransactionId,
        total_price: prices.total_price,
        total_amount: prices.cart_amount,
        delivery_fee: prices.delivery_fee,
        total_tax: prices.total_tax,
        store_type: storeType
    };

    var inserted = await db.insertQuery(db.tables.orders_history, data);
    return inserted.insertId;
}

/**
 * Insert products
 * 
 * @param {*} orderId 
 * @param {*} products 
 */
pub.insertProducts = async function (orderId, products) {
    for (var key in products) {
        var data = {
            order_id: orderId,
            depot_id: products[key].depot_id,
            quantity: products[key].quantity,
            price_sold: products[key].price,
            tax: products[key].tax
        };
        var success = await db.insertQuery(db.tables.orders_cart_items, data);
        if (!success) {
            return false;
        }
    }
    return true;
}

/**
 * Get order transaction by id
 * 
 * @param {*} transactionId 
 */
pub.getOrderTransactionById = async function (transactionId) {
    var data = {
        id: transactionId
    };
    var orderTransactions = await db.selectAllWhereLimitOne(db.tables.orders_transactions_history, data);
    if (orderTransactions.length > 0) {
        return orderTransactions[0];
    } else {
        return false;
    }
}

/**
 * Get order transactions by user id
 * 
 * @param {*} userId 
 */
pub.getOrderTransactionsByUserId = async function (userId) {
    var data = {
        user_id: userId
    };
    var orderTransactions = await db.selectAllWhere(db.tables.orders_transactions_history, data);
    return orderTransactions;
}

/**
 * Get order transactions by guest id
 * 
 * @param {*} userId 
 */
pub.getOrderTransactionsByGuestId = async function (userId) {
    var data = {
        guest_id: userId
    };
    var orderTransactions = await db.selectAllWhere(db.tables.orders_transactions_history, data);
    return orderTransactions;
}

/**
 * Get orders by order transaction id
 * 
 * @param {*} orderTransactionId 
 */
pub.getOrdersByTransactionId = async function (orderTransactionId) {
    var sqlQuery = `
        SELECT
        orders_history.id AS order_id,
        orders_history.id_prefix AS order_id_prefix,
        orders_history.date_assigned AS date_assigned,
        orders_history.date_arrived_store AS date_arrived_store,
        orders_history.date_picked AS date_picked,
        orders_history.date_arrived_customer AS date_arrived_customer,
        orders_history.date_delivered AS date_delivered,
        orders_history.store_id AS store_id,
        store_type.name AS store_type, 
        store_type.display_name AS store_type_display_name, 
        orders_history.driver_id AS driver_id,
        orders_history.refused AS refused,
        orders_history.receiver_name AS receiver_name,
        orders_history.receiver_age AS receiver_age

        FROM orders_history JOIN catalog_store_types AS store_type ON (orders_history.store_type = store_type.id)

        WHERE ?
        ORDER BY date_assigned`;

    var data = { "orders_history.order_transaction_id": orderTransactionId };

    var dbResult = await db.runQuery(sqlQuery, [data, data]);
    return dbResult;
}

/**
 * Get order contents by order id
 * 
 * @param {*} orderId 
 */
pub.getOrderItemsById = async function (orderId) {
    var sqlQuery = `
        SELECT
        cart_item.depot_id AS depot_id,
        store_type.name AS store_type,
        store_type.name AS store_type_display_name,
        category.name AS category,
        subcategory.name AS subcategory,
        type.name AS type,
        listing.brand AS brand,
        listing.name AS name,
        container.name AS container,
        packaging.name AS packaging,
        volume.name AS volume,
        depot.price AS price,
        product.image AS image,
        cart_item.quantity AS quantity,
        cart_item.price_sold AS price_sold,
        cart_item.tax AS tax
        
        FROM
        orders_cart_items AS cart_item JOIN catalog_depot AS depot ON (cart_item.depot_id = depot.id)
        JOIN catalog_items AS item ON (depot.item_id = item.id)
        JOIN catalog_products AS product ON (item.product_id = product.id)
        JOIN catalog_listings AS listing ON (product.listing_id = listing.id)
        JOIN catalog_types AS type ON (listing.type_id = type.id)
        JOIN catalog_subcategories AS subcategory ON (type.subcategory_id = subcategory.id)
        JOIN catalog_categories AS category ON (subcategory.category_id = category.id)
        JOIN catalog_store_types AS store_type ON (depot.store_type_id = store_type.id)
        JOIN catalog_packaging_containers AS container ON (product.container_id = container.id)
        JOIN catalog_packaging_packagings AS packaging ON (item.packaging_id = packaging.id)
        JOIN catalog_packaging_volumes AS volume ON (item.volume_id = volume.id)

        WHERE ?`;

    var data = { "cart_item.order_id": orderId };
    var dbResult = await db.runQuery(sqlQuery, [data, data]);
    return dbResult;
}

/**
 * Get user, transaction, and order by order id
 * 
 * @param {*} orderId 
 */
pub.getUserWithOrderByOrderId = async function (orderId) {
    var data = {
        id: orderId
    };

    var orders = await db.selectAllWhereLimitOne(db.tables.orders_history, data);
    if (orders.length > 0) {
        var order = orders[0];
        var transactionId = order.order_transaction_id;
        var transaction = await pub.getOrderTransactionById(transactionId);
        if (transaction) {
            var user;
            if (transaction.user_id == null) {
                user = await User.findGuestUserById(transaction.guest_id);
            } else {
                user = await User.findUserById(transaction.user_id);
            }
            var result = {
                transaction: transaction,
                order: order,
                user: user
            };
            return result;
        }
    }
    return false;
}

/**
 * Get all pending orders
 */
pub.getPendingOrders = async function () {
    var sqlQuery = `
        SELECT
        history.id AS order_id, history.id_prefix AS order_id_prefix, transaction.date_placed AS date_placed,
        history.date_assigned AS date_assigned, history.date_arrived_store AS date_arrived_store,
        history.date_picked AS date_picked, history.date_arrived_customer AS date_arrived_customer,
        history.date_delivered AS date_delivered, transaction.delivery_address AS delivery_address,
        transaction.delivery_latitude AS delivery_latitude, transaction.delivery_longitude AS delivery_longitude,
        transaction.driver_instruction AS driver_instruction,
        history.driver_id AS driver_id, history.store_id AS store_id,
        stores.id_prefix AS store_id_prefix, stores.name AS store_name,
        stores.address AS store_address, store_type.name AS store_type,
        users.id AS user_id, users.id_prefix AS user_id_prefix, users.user_email AS user_email,
        users.first_name AS first_name, users.last_name AS last_name, transaction.phone_number AS user_phone_number,
        users.birth_date AS user_birth_date
        FROM
        orders_history AS history,
        catalog_stores AS stores,
        catalog_store_types AS store_type,
        users_customers AS users,
        orders_transactions_history AS transaction
        WHERE
        transaction.id = history.order_transaction_id
        AND history.store_id = stores.id
        AND history.store_type = store_type.id
        AND transaction.user_id = users.id
        AND transaction.guest_id IS NULL
        AND history.date_delivered IS NULL
        
        UNION
        
        SELECT
        history.id AS order_id, history.id_prefix AS order_id_prefix, transaction.date_placed AS date_placed,
        history.date_assigned AS date_assigned, history.date_arrived_store AS date_arrived_store,
        history.date_picked AS date_picked, history.date_arrived_customer AS date_arrived_customer,
        history.date_delivered AS date_delivered, transaction.delivery_address AS delivery_address,
        transaction.delivery_latitude AS delivery_latitude, transaction.delivery_longitude AS delivery_longitude,
        transaction.driver_instruction AS driver_instruction,
        history.driver_id AS driver_id, history.store_id AS store_id,
        stores.id_prefix AS store_id_prefix,
        stores.name AS store_name, stores.address AS store_address, store_type.name AS store_type,
        guests.id AS user_id, guests.id_prefix AS user_id_prefix, guests.user_email AS user_email,
        guests.first_name AS first_name, guests.last_name AS last_name, transaction.phone_number AS user_phone_number,
        guests.birth_date AS user_birth_date
        FROM
        orders_history AS history,
        catalog_stores AS stores,
        catalog_store_types AS store_type,
        users_customers_guest AS guests,
        orders_transactions_history AS transaction    
        WHERE
        transaction.id = history.order_transaction_id
        AND history.store_id = stores.id
        AND history.store_type = store_type.id
        AND transaction.guest_id = guests.id
        AND transaction.user_id IS NULL
        AND history.date_delivered IS NULL
        
        UNION
        
        SELECT
        history.id AS order_id, history.id_prefix AS order_id_prefix, transaction.date_placed AS date_placed,
        history.date_assigned AS date_assigned, history.date_arrived_store AS date_arrived_store,
        history.date_picked AS date_picked, history.date_arrived_customer AS date_arrived_customer,
        history.date_delivered AS date_delivered, transaction.delivery_address AS delivery_address,
        transaction.delivery_latitude AS delivery_latitude, transaction.delivery_longitude AS delivery_longitude,
        transaction.driver_instruction AS driver_instruction,
        history.driver_id AS driver_id, NULL AS store_id, NULL AS store_id_prefix, NULL AS store_name,
        NULL AS store_address, store_type.name AS store_type, users.id AS user_id, users.id_prefix AS user_id_prefix,
        users.user_email AS user_email, users.first_name AS first_name, users.last_name AS last_name,
        transaction.phone_number AS user_phone_number, users.birth_date AS user_birth_date
        FROM
        orders_history AS history,
        catalog_store_types AS store_type,    
        users_customers AS users,
        orders_transactions_history AS transaction        
        WHERE
        transaction.id = history.order_transaction_id
        AND history.store_id IS NULL
        AND history.store_type = store_type.id    
        AND history.date_delivered IS NULL
        AND transaction.user_id = users.id
        AND transaction.guest_id IS NULL
        
        UNION
        
        SELECT
        history.id AS order_id, history.id_prefix AS order_id_prefix, transaction.date_placed AS date_placed,
        history.date_assigned AS date_assigned, history.date_arrived_store AS date_arrived_store,
        history.date_picked AS date_picked, history.date_arrived_customer AS date_arrived_customer,
        history.date_delivered AS date_delivered, transaction.delivery_address AS delivery_address,
        transaction.delivery_latitude AS delivery_latitude, transaction.delivery_longitude AS delivery_longitude,
        transaction.driver_instruction AS driver_instruction,
        history.driver_id AS driver_id, NULL AS store_id, NULL AS store_id_prefix, NULL AS store_name,
        NULL AS store_address, store_type.name AS store_type, guests.id AS user_id, guests.id_prefix AS user_id_prefix,
        guests.user_email AS user_email, guests.first_name AS first_name, guests.last_name AS last_name,
        transaction.phone_number AS user_phone_number, guests.birth_date AS user_birth_date
        FROM
        orders_history AS history,
        catalog_store_types AS store_type,    
        users_customers_guest AS guests,
        orders_transactions_history AS transaction            
        WHERE
        transaction.id = history.order_transaction_id
        AND history.store_id IS NULL
        AND history.store_type = store_type.id        
        AND history.date_delivered IS NULL
        AND transaction.guest_id = guests.id
        AND transaction.user_id IS NULL`;

    var pendingOrders = await db.runQuery(sqlQuery);
    return pendingOrders;
}

/**
 * Returns orders by transaction id
 * Also checks with user id
 * 
 * @param {*} transactionId 
 * @param {*} userId 
 */
pub.getOrdersByTransactionIdWithUserId = async function (transactionId, userId) {
    var transaction = await pub.getOrderTransactionById(transactionId);
    if (transaction) {
        if (transaction.user_id == userId) {
            var orders = await pub.getOrdersByTransactionId(transactionId);
            return orders;
        }
    }
    return false;
}

/**
 * Returns order items of specific order.
 * Also checks with user id
 * 
 * @param {*} orderId 
 * @param {*} userId 
 */
pub.getOrderItemsByIdUserId = async function (orderId, userId) {
    var userOrder = await pub.getUserWithOrderByOrderId(orderId);
    if (userOrder.user.id == userId) {
        var order = await pub.getOrderItemsById(orderId);
        return order;
    }
    return false;
}

/**
 * Have all orders related to the transaction been dispatched
 * 
 * @param {*} transactionId 
 */
pub.areAllDispatched = async function (transactionId) {
    var sqlQuery = `
        SELECT id
        FROM orders_history
        WHERE ?
        AND date_assigned IS NULL
        LIMIT 1
    `;

    var data = { order_transaction_id: transactionId };

    var dbResult = await db.runQuery(sqlQuery, data);
    return dbResult.length == 0;
}

/**
 * Finds users by phone number in orders transactions history
 * 
 * @param {*} phoneNumber 
 */
pub.getUsersByOrderPhone = async function (phoneNumber) {
    var sql = `
        SELECT DISTINCT user.id, user.id_prefix, user.user_email, user.first_name,
        user.last_name, user.phone_number, user.birth_date, user.address, false AS is_guest
        FROM orders_transactions_history AS transaction
        JOIN users_customers AS user ON (transaction.user_id = user.id)
        WHERE ?`;

    var data = { "transaction.phone_number": phoneNumber };

    var dbResult = await db.runQuery(sql, data);
    return dbResult;
}

/**
 * Finds guests by phone number in orders transactions history
 * 
 * @param {*} phoneNumber 
 */
pub.getGuestsByOrderPhone = async function (phoneNumber) {
    var sql = `
        SELECT DISTINCT guest.*, true AS is_guest
        FROM orders_transactions_history AS transaction
        JOIN users_customers_guest AS guest ON (transaction.guest_id = guest.id)
        WHERE ?`;

    var data = { "transaction.phone_number": phoneNumber };

    var dbResult = await db.runQuery(sql, data);
    return dbResult;
}

/**
 * Format order products 
 * 
 * @param {*} orderProducts 
 */
var getFormattedOrdersForStore = function (orderProducts) {
    var result = [];
    var currentItems = [];

    for (let i = 0; i < orderProducts.length; i++) {
        var item = {
            "depot_id": orderProducts[i].depot_id,
            "category": orderProducts[i].category,
            "category_display_name": orderProducts[i].category_display_name,
            "subcategory": orderProducts[i].subcategory,
            "type": orderProducts[i].type,
            "brand": orderProducts[i].brand,
            "name": orderProducts[i].name,
            "container": orderProducts[i].container,
            "packaging": orderProducts[i].packaging,
            "volume": orderProducts[i].volume,
            "price": orderProducts[i].price,
            "image": orderProducts[i].image,
            "quantity": orderProducts[i].quantity,
            "price_sold": orderProducts[i].price_sold,
            "tax": orderProducts[i].tax,
            "store_ready": orderProducts[i].store_ready
        };
        if (i == 0) {
            currentItems.push(item);
        } else {
            if (orderProducts[i].order_id != orderProducts[i - 1].order_id) {
                var order = {
                    "order_id": orderProducts[i - 1].order_id,
                    "order_id_prefix": orderProducts[i - 1].order_id_prefix,
                    "date_placed": orderProducts[i - 1].date_placed,
                    "date_assigned": orderProducts[i - 1].date_assigned,
                    "date_store_ready": orderProducts[i - 1].date_store_ready,
                    "date_arrived_store": orderProducts[i - 1].date_arrived_store,
                    "date_delivered": orderProducts[i - 1].date_delivered,
                    "driver": {
                        "driver_id_prefix": orderProducts[i - 1].driver_id_prefix,
                        "driver_id": orderProducts[i - 1].driver_id,
                        "driver_first_name": orderProducts[i - 1].driver_first_name,
                        "driver_last_name": orderProducts[i - 1].driver_last_name,
                        "driver_phone_number": orderProducts[i - 1].driver_phone_number
                    },
                    "products": currentItems
                };
                result.push(order);
                currentItems = [];
            }
            currentItems.push(item);
        }

        if (i == orderProducts.length - 1) {
            var order = {
                "order_id": orderProducts[i].order_id,
                "order_id_prefix": orderProducts[i].order_id_prefix,
                "date_placed": orderProducts[i].date_placed,
                "date_assigned": orderProducts[i].date_assigned,
                "date_store_ready": orderProducts[i].date_store_ready,
                "date_arrived_store": orderProducts[i].date_arrived_store,
                "date_delivered": orderProducts[i].date_delivered,
                "driver": {
                    "driver_id_prefix": orderProducts[i].driver_id_prefix,
                    "driver_id": orderProducts[i].driver_id,
                    "driver_first_name": orderProducts[i].driver_first_name,
                    "driver_last_name": orderProducts[i].driver_last_name,
                    "driver_phone_number": orderProducts[i].driver_phone_number
                },
                "products": currentItems
            };
            result.push(order);
        }
    }
    return result;
}

/**
 * Get pending orders by store id
 * 
 * @param {*} storeId 
 */
pub.getPendingOrdersWithItemsByStoreId = async function (storeId) {
    let sqlCondition = "history.date_picked IS NULL";
    return await getOrdersWithItemsByStoreId(storeId, sqlCondition);
}

/**
 * Get pending orders by store id
 * 
 * @param {*} storeId 
 */
pub.getAllOrdersWithItemsByStoreId = async function (storeId) {
    let sqlCondition = "1=1";
    return await getOrdersWithItemsByStoreId(storeId, sqlCondition);
}

/**
 * Get pevious orders by store id
 * 
 * @param {*} storeId 
 */
pub.getPreviousOrdersWithItemsByStoreId = async function (storeId) {
    let sqlCondition = "history.date_picked IS NOT NULL";
    return await getOrdersWithItemsByStoreId(storeId, sqlCondition);
}

/**
 * Get orders by store id based on condition
 * 
 * @param {*} storeId 
 * @param {*} sqlCondition 
 */
var getOrdersWithItemsByStoreId = async function (storeId, sqlCondition) {
    var sqlGeneric = `
        history.id AS order_id, history.id_prefix AS order_id_prefix, transaction.date_placed AS date_placed,
        history.date_assigned AS date_assigned, history.date_store_ready AS date_store_ready,
        history.date_arrived_store AS date_arrived_store, history.date_delivered AS date_delivered,
        history.driver_id AS driver_id, 
        cart_item.depot_id AS depot_id,
        category.name AS category,
        category.display_name AS category_display_name,
        subcategory.name AS subcategory,
        type.name AS type,
        listing.brand AS brand,
        listing.name AS name,
        container.name AS container,
        packaging.name AS packaging,
        volume.name AS volume,
        depot.price AS price,
        product.image AS image,
        cart_item.quantity AS quantity,
        cart_item.price_sold AS price_sold,
        cart_item.tax AS tax,
        cart_item.store_ready AS store_ready
        
        FROM orders_history AS history JOIN orders_transactions_history AS transaction ON (history.order_transaction_id = transaction.id)
        JOIN orders_cart_items AS cart_item ON (cart_item.order_id = history.id)
        JOIN catalog_depot AS depot ON (cart_item.depot_id = depot.id)
        JOIN catalog_items AS item ON (depot.item_id = item.id)
        JOIN catalog_products AS product ON (item.product_id = product.id)
        JOIN catalog_listings AS listing ON (product.listing_id = listing.id)
        JOIN catalog_types AS type ON (listing.type_id = type.id)
        JOIN catalog_subcategories AS subcategory ON (type.subcategory_id = subcategory.id)
        JOIN catalog_categories AS category ON (subcategory.category_id = category.id)
        JOIN catalog_store_types AS store_type ON (depot.store_type_id = store_type.id)
        JOIN catalog_packaging_containers AS container ON (product.container_id = container.id)
        JOIN catalog_packaging_packagings AS packaging ON (item.packaging_id = packaging.id)
        JOIN catalog_packaging_volumes AS volume ON (item.volume_id = volume.id)
    `;

    var sqlQuery = `
        SELECT driver.first_name AS driver_first_name, driver.last_name AS driver_last_name,
        driver.phone_number AS driver_phone_number, driver.id_prefix AS driver_id_prefix,`
        + sqlGeneric + `
        JOIN drivers AS driver ON (history.driver_id = driver.id)        
        WHERE `
        + sqlCondition + `
        AND ?
        
        ORDER BY order_id DESC
    `;

    var data = { "history.store_id": storeId };
    var dbResult = await db.runQuery(sqlQuery, [data, data]);
    return getFormattedOrdersForStore(dbResult);
}

/**
 * Update store ready in orders_cart_items
 * 
 * @param {*} orderIds 
 * @param {*} depotId 
 * @param {*} picked 
 */
pub.updateItemPicked = async function (orderIds, depotId, picked) {
    var sqlQuery = `
        UPDATE orders_cart_items
        SET store_ready = ` + picked + `
        WHERE order_id IN (` + orderIds + `)
        AND ?`;

    var data = { "depot_id": depotId };
    await db.runQuery(sqlQuery, data);
}

/**
 * Update store ready date if all items are picked by store
 * 
 * @param {*} orderId 
 */
pub.checkForStoreReady = async function (orderId) {
    var sqlQuery = `
        SELECT id
        FROM orders_cart_items
        WHERE store_ready = false
        AND ? 
        LIMIT 1`;

    var data = { "order_id": orderId };
    var dbResult = await db.runQuery(sqlQuery, data);
    if (dbResult.length == 0) {
        updateDateStoreReady(orderId, "CURRENT_TIMESTAMP");
    }
}

/**
 * Updates date store ready column to NULL
 * 
 * @param {*} orderId 
 */
pub.checkForStoreNotReady = async function (orderId) {
    updateDateStoreReady(orderId, "NULL");
}

/**
 * Update date store ready column with value given
 * 
 * @param {*} orderId 
 * @param {*} sqlDate 
 */
var updateDateStoreReady = function (orderId, sqlDate) {
    var sqlQuery = `
        UPDATE orders_history
        SET date_store_ready = ` + sqlDate + `
        WHERE ?`;
    var data = { "id": orderId };
    db.runQuery(sqlQuery, data);
}

module.exports = pub;