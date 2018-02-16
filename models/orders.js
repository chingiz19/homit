/**
 * @copyright Homit 2018
 */

var pub = {};
/* Creates order in orders_history table */
pub.createOrder = function (id, address, address_lat, address_long, driverInstruction, isGuest, transactionId, cardNumber, totalPrice, superCategory) {
    return Catalog.getSuperCategoryIdByName(superCategory).then(function (superCategoryId) {
        var data = {
            delivery_address: address,
            store_type: superCategoryId,
            delivery_latitude: address_lat,
            delivery_longitude: address_long,
            transaction_id: transactionId,
            card_digits: cardNumber,
            total_price: totalPrice
        };
        if (isGuest) {
            data.guest_id = id;
        } else {
            data.user_id = id;
        }
        if (driverInstruction) {
            data.driver_instruction = driverInstruction;
        };

        return db.insertQuery(db.dbTables.orders_history, data).then(function (inserted) {
            return inserted.insertId;
        });
    });
};

/* Inserts products */
pub.insertProducts = function (orderId, products) {
    for (var key in products) {
        var data = {
            order_id: orderId,
            depot_id: products[key].depot_id,
            quantity: products[key].quantity,
            price_sold: products[key].price,
            tax: products[key].tax
        };
        db.insertQuery(db.dbTables.orders_cart_info, data).then(function (success) {
            if (!success) {
                return false;
            }
        });
    }
    return true;
};

/* Get user's order by user id */
pub.getOrdersByUserId = function (user_id) {
    var sqlQuery = `
        SELECT
        orders_history.id AS order_id,
        orders_history.id_prefix AS order_id_prefix,
        orders_history.date_placed AS date_placed,
        orders_history.date_assigned AS date_assigned,
        orders_history.date_arrived_store AS date_arrived_store,
        orders_history.date_picked AS date_picked,
        orders_history.date_arrived_customer AS date_arrived_customer,
        orders_history.date_delivered AS date_delivered,
        orders_history.delivery_address AS delivery_address,
        orders_history.store_id AS store_id,
        orders_history.driver_instruction AS driver_instruction,        
        super_categories.name AS super_category, 
        super_categories.name AS super_category_custom, 
        orders_history.driver_id AS driver_id,
        orders_history.refused AS refused,
        orders_history.receiver_name AS receiver_name,
        orders_history.receiver_age AS receiver_age

        FROM orders_history, users_customers as users,
        catalog_super_categories AS super_categories
        WHERE super_categories.id = orders_history.store_type
        AND orders_history.user_id = users.id AND ?
        AND super_categories.name NOT IN ('` + Catalog.safewaySuperCategory + `', '` + Catalog.convenienceSuperCategory + `', '` + Catalog.homitCarSuperCategory + `')

        UNION

        SELECT
        orders_history.id AS order_id,
        orders_history.id_prefix AS order_id_prefix,
        orders_history.date_placed AS date_placed,
        orders_history.date_assigned AS date_assigned,
        orders_history.date_arrived_store AS date_arrived_store,
        orders_history.date_picked AS date_picked,
        orders_history.date_arrived_customer AS date_arrived_customer,
        orders_history.date_delivered AS date_delivered,
        orders_history.delivery_address AS delivery_address,
        orders_history.store_id AS store_id,
        orders_history.driver_instruction AS driver_instruction,  
        super_categories.name AS super_category,               
        '` + Catalog.snackVendorSuperCategory + `' AS super_category_custom,   
        orders_history.driver_id AS driver_id,
        orders_history.refused AS refused,
        orders_history.receiver_name AS receiver_name,
        orders_history.receiver_age AS receiver_age

        FROM orders_history, users_customers as users,
        catalog_super_categories AS super_categories
        WHERE super_categories.id = orders_history.store_type
        AND orders_history.user_id = users.id AND ?
        AND super_categories.name IN ('` + Catalog.safewaySuperCategory + `', '` + Catalog.convenienceSuperCategory + `', '` + Catalog.homitCarSuperCategory + `')
        
        ORDER BY date_placed`;

    var data = { "users.id": user_id };

    return getOrdersWithQuery(sqlQuery, data);
};

/* Get guest user's order by guest user id */
pub.getOrdersByGuestId = function (user_id) {
    var sqlQuery = `
        SELECT
        orders_history.id AS order_id,
        orders_history.id_prefix AS order_id_prefix,
        orders_history.date_placed AS date_placed,
        orders_history.date_assigned AS date_assigned,
        orders_history.date_arrived_store AS date_arrived_store,
        orders_history.date_picked AS date_picked,
        orders_history.date_arrived_customer AS date_arrived_customer,
        orders_history.date_delivered AS date_delivered,
        orders_history.delivery_address AS delivery_address,
        orders_history.store_id AS store_id,
        orders_history.driver_instruction AS driver_instruction,
        super_categories.name AS super_category,    
        super_categories.name AS super_category_custom,    
        orders_history.driver_id AS driver_id,
        orders_history.refused AS refused,
        orders_history.receiver_name AS receiver_name,
        orders_history.receiver_age AS receiver_age

        FROM orders_history, users_customers_guest AS guests,
        catalog_super_categories AS super_categories
        WHERE super_categories.id = orders_history.store_type
        AND orders_history.guest_id = guests.id AND ?
        AND super_categories.name NOT IN ('` + Catalog.safewaySuperCategory + `', '` + Catalog.convenienceSuperCategory + `', '` + Catalog.homitCarSuperCategory + `')

        UNION

        SELECT
        orders_history.id AS order_id,
        orders_history.id_prefix AS order_id_prefix,
        orders_history.date_placed AS date_placed,
        orders_history.date_assigned AS date_assigned,
        orders_history.date_arrived_store AS date_arrived_store,
        orders_history.date_picked AS date_picked,
        orders_history.date_arrived_customer AS date_arrived_customer,
        orders_history.date_delivered AS date_delivered,
        orders_history.delivery_address AS delivery_address,
        orders_history.store_id AS store_id,
        orders_history.driver_instruction AS driver_instruction,
        super_categories.name AS super_category, 
        '` + Catalog.snackVendorSuperCategory + `' AS super_category_custom,
        orders_history.driver_id AS driver_id,
        orders_history.refused AS refused,
        orders_history.receiver_name AS receiver_name,
        orders_history.receiver_age AS receiver_age

        FROM orders_history, users_customers_guest AS guests,
        catalog_super_categories AS super_categories
        WHERE super_categories.id = orders_history.store_type
        AND orders_history.guest_id = guests.id AND ?
        AND super_categories.name IN ('` + Catalog.safewaySuperCategory + `', '` + Catalog.convenienceSuperCategory + `', '` + Catalog.homitCarSuperCategory + `')


        ORDER BY date_placed`;

    var data = { "guests.id": user_id };

    return getOrdersWithQuery(sqlQuery, data);
};

function getOrdersWithQuery(sqlQuery, data) {
    return db.runQuery(sqlQuery, [data, data]).then(function (dbResult) {
        return dbResult;
    });
}

pub.getOrderById = function (orderId) {
    var sqlQuery = `
        SELECT
        orders_cart_info.depot_id AS depot_id, super_categories.name AS super_category,
        super_categories.name AS super_category_custom,
        categories.name AS category, subcategories.name AS subcategory, types.name AS type,
        listings.product_brand AS brand, listings.product_name AS name,
        listings.product_description AS description, listings.product_country AS country,
        containers.name AS container, packagings.name AS packaging, volumes.volume_name AS volume,
        depot.price AS price, products.product_image AS image, orders_cart_info.quantity AS quantity,
        orders_cart_info.price_sold AS price_sold, orders_cart_info.tax AS tax
        
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
        AND ?
        AND super_categories.name NOT IN ('` + Catalog.safewaySuperCategory + `', '` + Catalog.convenienceSuperCategory + `', '` + Catalog.homitCarSuperCategory + `')
        
        UNION
        
        SELECT
        orders_cart_info.depot_id AS depot_id, super_categories.name AS super_category,
        '` + Catalog.snackVendorSuperCategory + `' AS super_category_custom,
        categories.name AS category, subcategories.name AS subcategory, types.name AS type,
        listings.product_brand AS brand, listings.product_name AS name,
        listings.product_description AS description, listings.product_country AS country,
        containers.name AS container, packagings.name AS packaging, volumes.volume_name AS volume,
        depot.price AS price, products.product_image AS image, orders_cart_info.quantity AS quantity,
        orders_cart_info.price_sold AS price_sold, orders_cart_info.tax AS tax
        
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
        AND ?
        AND super_categories.name IN ('` + Catalog.safewaySuperCategory + `', '` + Catalog.convenienceSuperCategory + `', '` + Catalog.homitCarSuperCategory + `')
        `

    var data = { "orders_cart_info.order_id": orderId };
    return db.runQuery(sqlQuery, [data, data]).then(function (dbResult) {
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

pub.getUserWithOrderByOrderId = function (orderId) {
    var data = {
        id: orderId
    };

    return db.selectAllWhere(db.dbTables.orders_history, data).then(function (orders) {
        if (orders.length > 0) {
            var order = orders[0];
            if (order.user_id == null) {
                return User.findGuestUserById(order.guest_id).then(function (user) {
                    var result = {
                        order: order,
                        user: user
                    };
                    return result;
                });
            } else {
                return User.findUserById(order.user_id).then(function (user) {
                    var result = {
                        order: order,
                        user: user
                    };
                    return result;
                });
            }
        } else {
            return false;
        }
    });
};

pub.getPendingOrders = function () {
    var sqlQuery = `
    SELECT
    history.id AS order_id, history.id_prefix AS order_id_prefix, history.date_placed AS date_placed,
    history.date_assigned AS date_assigned, history.date_arrived_store AS date_arrived_store,
    history.date_picked AS date_picked, history.date_arrived_customer AS date_arrived_customer,
    history.date_delivered AS date_delivered, history.delivery_address AS delivery_address,
    history.delivery_latitude AS delivery_latitude, history.delivery_longitude AS delivery_longitude,
    history.driver_instruction AS driver_instruction,
    history.driver_id AS driver_id, history.store_id AS store_id,
    stores.id_prefix AS store_id_prefix, stores.name AS store_name,
    stores.address AS store_address, super_categories.name AS super_category,
    users.id AS user_id, users.id_prefix AS user_id_prefix, users.user_email AS user_email,
    users.first_name AS first_name, users.last_name AS last_name, users.phone_number AS user_phone_number,
    users.birth_date AS user_birth_date
    FROM
    orders_history AS history,
    catalog_stores AS stores,
    catalog_super_categories AS super_categories,
    users_customers AS users
    WHERE
    history.store_id = stores.id
    AND history.store_type = super_categories.id
    AND history.user_id = users.id
    AND history.date_delivered IS NULL
    
    UNION
    
    SELECT history.id AS order_id, history.id_prefix AS order_id_prefix, history.date_placed AS date_placed,
    history.date_assigned AS date_assigned, history.date_arrived_store AS date_arrived_store,
    history.date_picked AS date_picked, history.date_arrived_customer AS date_arrived_customer,
    history.date_delivered AS date_delivered, history.delivery_address AS delivery_address,
    history.delivery_latitude AS delivery_latitude, history.delivery_longitude AS delivery_longitude,    
    history.driver_instruction AS driver_instruction,
    history.driver_id AS driver_id, history.store_id AS store_id,
    stores.id_prefix AS store_id_prefix,
    stores.name AS store_name, stores.address AS store_address, super_categories.name AS super_category,
    guests.id AS user_id, guests.id_prefix AS user_id_prefix, guests.user_email AS user_email,
    guests.first_name AS first_name, guests.last_name AS last_name, guests.phone_number AS user_phone_number,
    guests.birth_date AS user_birth_date
    FROM
    orders_history AS history,
    catalog_stores AS stores,
    catalog_super_categories AS super_categories,
    users_customers_guest AS guests
    WHERE
    history.store_id = stores.id
    AND history.store_type = super_categories.id
    AND history.guest_id = guests.id
    AND history.date_delivered IS NULL
    
    UNION
    
    SELECT history.id AS order_id, history.id_prefix AS order_id_prefix, history.date_placed AS date_placed,
    history.date_assigned AS date_assigned, history.date_arrived_store AS date_arrived_store,
    history.date_picked AS date_picked, history.date_arrived_customer AS date_arrived_customer,
    history.date_delivered AS date_delivered, history.delivery_address AS delivery_address,
    history.delivery_latitude AS delivery_latitude, history.delivery_longitude AS delivery_longitude,        
    history.driver_instruction AS driver_instruction,
    history.driver_id AS driver_id, NULL AS store_id, NULL AS store_id_prefix, NULL AS store_name,
    NULL AS store_address, super_categories.name AS super_category, users.id AS user_id, users.id_prefix AS user_id_prefix,
    users.user_email AS user_email, users.first_name AS first_name, users.last_name AS last_name,
    users.phone_number AS user_phone_number, users.birth_date AS user_birth_date
    FROM
    orders_history AS history,
    catalog_super_categories AS super_categories,    
    users_customers AS users
    WHERE
    history.store_id IS NULL
    AND history.store_type = super_categories.id    
    AND history.date_delivered IS NULL
    AND history.user_id = users.id
    
    UNION
    
    SELECT history.id AS order_id, history.id_prefix AS order_id_prefix, history.date_placed AS date_placed,
    history.date_assigned AS date_assigned, history.date_arrived_store AS date_arrived_store,
    history.date_picked AS date_picked, history.date_arrived_customer AS date_arrived_customer,
    history.date_delivered AS date_delivered, history.delivery_address AS delivery_address,
    history.delivery_latitude AS delivery_latitude, history.delivery_longitude AS delivery_longitude,        
    history.driver_instruction AS driver_instruction,
    history.driver_id AS driver_id, NULL AS store_id, NULL AS store_id_prefix, NULL AS store_name,
    NULL AS store_address, super_categories.name AS super_category, guests.id AS user_id, guests.id_prefix AS user_id_prefix,
    guests.user_email AS user_email, guests.first_name AS first_name, guests.last_name AS last_name,
    guests.phone_number AS user_phone_number, guests.birth_date AS user_birth_date
    FROM
    orders_history AS history,
    catalog_super_categories AS super_categories,    
    users_customers_guest AS guests
    WHERE
    history.store_id IS NULL
    AND history.store_type = super_categories.id        
    AND history.date_delivered IS NULL
    AND history.guest_id = guests.id
    `;

    return db.runQuery(sqlQuery).then(function (pendingOrders) {
        return pendingOrders;
    });
};

pub.checkTransaction = function (transactionId) {
    var data = {
        transaction_id: transactionId
    };

    return db.selectAllWhere(db.dbTables.orders_history, data).then(function (orders) {
        if (orders.length > 0) {
            return false;
        } else {
            return true;
        }
    });
};

pub.isDelivered = function (orderId) {
    var sqlQuery = `
        SELECT *
        FROM orders_history
        WHERE date_delivered IS NULL AND ?`

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

    return db.insertQuery(db.dbTables.orders_history_refund, data).then(function (inserted) {
        return inserted.insertId;
    });

};


/**
 * Change data in orders_cart_info table. 
 * Used by full cancel and full refund.
 * @param {*Number} orderId 
 */
pub.placeFullRefundCart = function (orderId) {
    var selectData = {
        order_id: orderId
    };

    return db.selectAllWhere(db.dbTables.orders_cart_info, selectData).then(function (items) {
        var data = {
            modified_quantity: 0
        };
        var key = {
            order_id: orderId
        };
        return db.updateQuery(db.dbTables.orders_cart_info, [data, key]).then(function (updated) {
            return items;
        });
    });
};


/**
 * Change data in orders_cart_info table. 
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
    FROM orders_cart_info
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

                    updateFunctions.push(db.updateQuery(db.dbTables.orders_cart_info, [updateData, key]));
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

    return db.insertQuery(db.dbTables.orders_history_cancel, insertData).then(function (inserted) {
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

    return db.insertQuery(db.dbTables.orders_history_add, insertData).then(function (inserted) {
        return inserted.insertId;
    });
};


/**
 * Calculates modified amount.
 * If customer owes us, the result will be positive.
 * If we owe customer, the result will be negative.
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
        FROM orders_cart_info
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
        FROM orders_cart_info
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

    return db.selectAllWhere(db.dbTables.orders_history, data).then(function (orders) {
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
    return db.updateQuery(db.dbTables.orders_history_refund, [data, key]).then(function (updated) {
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
    return db.updateQuery(db.dbTables.orders_history_cancel, [data, key]).then(function (updated) {
        return updated;
    });
};

pub.areAllDispatched = function (transactionId) {
    var sqlQuery = `
        SELECT *
        FROM orders_history
        WHERE ?
        AND date_assigned IS NULL
    `;

    var data = { transaction_id: transactionId };

    return db.runQuery(sqlQuery, data).then(function (dbResult) {
        if (dbResult.length > 0) {
            return false;
        } else {
            return true;
        }
    });
};

module.exports = pub;