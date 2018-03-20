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
pub.createOrder = async function (orderTransactionId, storeType) {
    var storeType = await Catalog.getStoreTypeIdByName(storeType);
    var data = {
        order_transaction_id: orderTransactionId,
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


// Below are refund methods - they need to be revisited
pub.isDelivered = function (orderId) {
    var sqlQuery = `
        SELECT id
        FROM orders_history
        WHERE date_delivered IS NULL AND ?
        LIMIT 1`

    var data = { id: orderId };
    return db.runQuery(sqlQuery, data).then(function (orders) {
        if (orders.length > 0) {
            return false;
        } else {
            return true;
        }
    });
};

/**
 * Inserts data into orders_history_refund table.
 * @param {*Number} orderId 
 * @param {*Number} csrActionId 
 * @param {*Number} dateScheduled 
 * @param {*Number} dateScheduledNote 
 */
pub.placeRefundHistory = function (orderId, csrActionId, dateScheduled, dateScheduledNote) {
    var data = {
        order_id: orderId,
        csr_action_id: csrActionId
    };

    if (dateScheduled) {
        data.date_scheduled = dateScheduled;
    }
    if (dateScheduledNote) {
        data.date_scheduled_note = dateScheduledNote;
    }

    return db.insertQuery(db.tables.orders_history_refund, data).then(function (inserted) {
        return inserted.insertId;
    });

};

/**
 * Change data in orders_cart_items table. 
 * Used by full cancel and full refund.
 * @param {*Number} orderId 
 */
pub.placeFullRefundCart = function (orderId) {
    var selectData = {
        order_id: orderId
    };

    return db.selectAllWhere(db.tables.orders_cart_items, selectData).then(function (items) {
        var data = {
            modified_quantity: 0
        };
        var key = {
            order_id: orderId
        };
        return db.updateQuery(db.tables.orders_cart_items, [data, key]).then(function (updated) {
            return items;
        });
    });
};

/**
 * Change data in orders_cart_items table. 
 * @param {*Number} orderId 
 * @param {*Number} refundItems 
 */
pub.placePartialRefundCart = function (orderId, refundItems) {
    var selectData = {
        order_id: orderId
    };

    var sqlQuery = `
    SELECT id, order_id, depot_id, quantity, price_sold AS price,
    modified_quantity, tax
    FROM orders_cart_items
    WHERE ?;`

    return db.runQuery(sqlQuery, selectData).then(function (items) {

        var queriesToRun = [];
        var updateFunctions = [];
        for (var i = 0; i < items.length; i++) {
            var refundItem = refundItems[items[i].id]; //TODO: ZZ - might cause an error
            if (refundItem != undefined) {
                if (refundItem.modify_quantity != 0) {
                    var newQuantity;

                    if (items[i].modified_quantity != undefined) {
                        newQuantity = parseInt(items[i].modified_quantity) + parseInt(refundItem.modify_quantity);
                    } else {
                        newQuantity = parseInt(items[i].quantity) + parseInt(refundItem.modify_quantity);
                    }

                    if (newQuantity < 0) {
                        newQuantity = 0;
                    }

                    var updateData = {
                        modified_quantity: newQuantity
                    };
                    var key = {
                        id: refundItem.id
                    };

                    updateFunctions.push(db.updateQuery(db.tables.orders_cart_items, [updateData, key]));
                }
            }
        }
        return Promise.all(updateFunctions).then(function (updated) {
            return items;
        });
    });
};

/**
 * Insert data into orders_history_cancel table.
 * @param {*} orderId 
 * @param {*} csrActionId 
 */
pub.placeCancelHistory = function (orderId, csrActionId) {
    var insertData = {
        order_id: orderId,
        csr_action_id: csrActionId
    };

    return db.insertQuery(db.tables.orders_history_cancel, insertData).then(function (inserted) {
        return inserted.insertId;
    });
};

/**
 * Inserts data into orders_history_add table.
 * @param {*Number} orderId 
 * @param {*Number} csrActionId 
 * @param {*Number} chargeAmount 
 */
pub.placeAddHistory = function (orderId, csrActionId, chargeAmount) {
    var insertData = {
        order_id: orderId,
        csr_action_id: csrActionId,
        charge_amount: chargeAmount
    };

    return db.insertQuery(db.tables.orders_history_add, insertData).then(function (inserted) {
        return inserted.insertId;
    });
};


/**
 * Calculates modified amount.
 * If customer owes us, the result will be positive.
 * If we owe customer, the result will be negative.
 * 
 * @param {*Number} orderId 
 */
pub.calculateModifiedAmount = function (orderId, oldItems, refund) {
    var depotQuantities = {};
    var data = {
        order_id: orderId
    };

    var sqlQuery = `
        SELECT id, order_id, depot_id, quantity, price_sold AS price,
        modified_quantity, tax
        FROM orders_cart_items
        WHERE ?;`

    return db.runQuery(sqlQuery, data).then(function (items) {
        if (items.length == oldItems.length) {
            for (var i = 0; i < items.length; i++) {
                var tempQuantity = 0;

                if (items[i].modified_quantity != undefined) {
                    if (oldItems[i].modified_quantity != undefined) {
                        tempQuantity = oldItems[i].modified_quantity - items[i].modified_quantity;
                    } else {
                        tempQuantity = items[i].quantity - items[i].modified_quantity;
                    }
                }
                depotQuantities[items[i].depot_id] = tempQuantity;
            }

            price = Catalog.priceCalculator(depotQuantities, items, refund);
            return price;
        }
    });
};


/**
 * Calculates modified amount.
 * If customer owes us, the result will be positive.
 * If we owe customer, the result will be negative.
 * @param {*Number} orderId 
 */
pub.calculatePartialCancelAmount = function (orderId, oldItems, refund) {
    var oldDepotQuantities = {};
    var newDepotQuantities = {};

    var data = {
        order_id: orderId
    };

    var sqlQuery = `
        SELECT id, order_id, depot_id, quantity, price_sold AS price,
        modified_quantity, tax
        FROM orders_cart_items
        WHERE ?;`

    return db.runQuery(sqlQuery, data).then(function (items) {
        if (items.length == oldItems.length) {
            for (var i = 0; i < items.length; i++) {
                var tempQuantityOld = 0;
                var tempQuantityNew = 0;

                if (oldItems[i].modified_quantity != undefined) {
                    tempQuantityOld = oldItems[i].modified_quantity;
                } else {
                    tempQuantityOld = oldItems[i].quantity;
                }

                if (items[i].modified_quantity != undefined) {
                    tempQuantityNew = items[i].modified_quantity;
                } else {
                    tempQuantityNew = items[i].quantity;
                }

                oldDepotQuantities[oldItems[i].depot_id] = tempQuantityOld;
                newDepotQuantities[oldItems[i].depot_id] = tempQuantityNew;
            }

            oldPrice = Catalog.priceCalculator(oldDepotQuantities, oldItems, refund);
            newPrice = Catalog.priceCalculator(newDepotQuantities, oldItems, refund);


            var deliveryFeeDiff = parseFloat((oldPrice.delivery_fee - newPrice.delivery_fee).toFixed(2));
            var totalAmountDiff = parseFloat((oldPrice.cart_amount - newPrice.cart_amount).toFixed(2));
            var totalTaxDiff = parseFloat((oldPrice.total_tax - newPrice.total_tax).toFixed(2));
            var totalPriceDif = parseFloat((oldPrice.total_price - newPrice.total_price).toFixed(2));

            var result = {
                "cart_amount": totalAmountDiff,
                "delivery_fee": deliveryFeeDiff,
                "total_tax": totalTaxDiff,
                "total_price": totalPriceDif
            }
            return result;
        }
    });
};

pub.getOrderInfo = function (orderId) {
    var data = {
        id: orderId
    };

    return db.selectAllWhere(db.tables.orders_history, data).then(function (orders) {
        if (orders.length > 0) {
            return orders[0];
        } else {
            return false;
        }
    });
};

pub.updateRefundAmount = function (refundHistoryId, customerRefundAmount) {
    var data = {
        refund_amount: customerRefundAmount
    };
    var key = {
        id: refundHistoryId
    };
    return db.updateQuery(db.tables.orders_history_refund, [data, key]).then(function (updated) {
        return updated;
    });
};

pub.updateCancelAmount = function (cancelHistoryId, customerRefundAmount) {
    var data = {
        refund_amount: customerRefundAmount
    };
    var key = {
        id: cancelHistoryId
    };
    return db.updateQuery(db.tables.orders_history_cancel, [data, key]).then(function (updated) {
        return updated;
    });
};

module.exports = pub;