/**
 * @copyright Homit 2018
 */
var pub = {};

pub.findDriver = function (email) {
    var data = { user_email: email };
    return db.selectAllWhereLimitOne(db.tables.drivers, data).then(function (dbResult) {
        if (dbResult.length > 0) {
            return User.sanitizeUserObject(dbResult[0]);
        } else {
            return false;
        }
    });
};

/* Find driver from database*/
pub.findDriverById = function (driverId) {
    var data = { id: driverId };
    return db.selectAllWhereLimitOne(db.tables.drivers, data).then(function (dbResult) {
        if (dbResult.length > 0) {
            return User.sanitizeUserObject(dbResult[0]);
        } else {
            return false;
        }
    });
};

/* Find driver firebase token from database*/
pub.findFirebaseTokenById = async function (driverId) {
    let data = {
        driver_id: driverId
    };

    let driverStatus = await db.selectAllWhereLimitOne(db.tables.drivers_status, data);

    if (driverStatus.length > 0) {
        return driverStatus[0].token;
    }
};

/* Destroy driver firebase token at database*/
pub.destroyFirebaseTokenById = async function (driverId) {
    let data = {
        driver_id: driverId
    };

    let result = await db.deleteQuery(db.tables.drivers_status, data);

    return result;
};

/* Save driver firebase token to database*/
pub.saveFirebaseTokenById = async function (driverId, mToken) {
    if (!mToken) {
        return false;
    }
    let data = { driver_id: driverId };
    let dataUpdate = { token: mToken };
    let result = await db.updateQuery(db.tables.drivers_status, [dataUpdate, data]);
    return result;
};


/* Authenticate driver */
pub.authenticateDriver = function (email, password) {
    let data = { user_email: email };
    return db.selectAllWhereLimitOne(db.tables.drivers, data).then(function (driver) {
        if (driver.length > 0) {
            return Auth.comparePassword(password, driver[0].password).then(function (match) {
                if (match) {
                    return sanitizeDriverObject(driver[0]);
                } else {
                    return false;
                }
            });
        } else {
            return false;
        }
    });
};

pub.getActiveDrivers = async function () {
    let sqlQuery = `
        SELECT
        drivers.id AS driver_id,
        drivers.id_prefix AS driver_id_prefix,
        drivers.user_email,
        drivers.first_name,
        drivers.last_name,
        drivers.phone_number,
        status.latitude,
        status.longitude,
        status.online
        
        FROM drivers, drivers_status AS status
        WHERE drivers.id = status.driver_id
    `;

    let activeDrivers = await db.runQuery(sqlQuery);
    return activeDrivers;
}

/**
 * Return true if driver exists in status table
 * 
 * @param {*} driverId 
 */
pub.getDriverStatus = async function (driverId) {
    let data = {
        driver_id: driverId
    };

    let result = await db.selectAllWhereLimitOne(db.tables.drivers_status, data);

    if (result.length > 0) {
        return result[0];
    } else {
        return { online: 0 };
    }
}

/**
 * Check if driver's shift was started
 * 
 * @param {*} driverId 
 */
var shiftStarted = async function (driverId) {
    var sqlQuery = `
        SELECT *
        FROM drivers_shift_history
        WHERE shift_end IS NULL   
        AND ?
        LIMIT 1`;
    let data = { driver_id: driverId };
    let dbResult = await db.runQuery(sqlQuery, data);
    return dbResult.length != 0;
}

/**
 * Start driver's schedule and set the online flag
 * 
 * @param {*} driverId 
 */
pub.saveOnline = async function (driverId) {
    let started = await shiftStarted(driverId);

    if (!started) {
        let data = { driver_id: driverId };
        await db.insertQuery(db.tables.drivers_shift_history, data);
    }

    return await setDriverOnlineFlag(driverId, true);
}

/**
 * Set the driver's flag to offline.
 * End shift if driver doesn't have any orders.
 * 
 * @param {*} driverId 
 */
pub.saveOffline = async function (driverId) {
    let result = await setDriverOnlineFlag(driverId, false);
    await endShift(driverId);                                     //TODO Zaman I think we should get rid off this

    return (result);
}

/**
 * Update driver's location in drivers_status table
 * 
 * @param {*} driverId 
 * @param {*} location 
 */
pub.updateLocation = async function (driverId, latitude, longitude) {
    let updateData = {
        longitude: longitude,
        latitude: latitude
    };
    let key = {
        driver_id: driverId
    };

    let result = await db.updateQuery(db.tables.drivers_status, [updateData, key]);
    return result;
}

/**
 * Set driver flag in drivers_status table
 * 
 * @param {*} driverId 
 * @param {*} status 
 */
var setDriverOnlineFlag = async function (driverId, status) {
    let data = {
        online: status
    };
    let key = {
        driver_id: driverId
    };
    return await db.updateQuery(db.tables.drivers_status, [data, key]);
}

/**
 * Update driver status table when driver signedIn 
 * 
 * @param {*} driverId 
 */
pub.insertDriverStatusTable = async function (driverId) {
    let update = await driverStatusExists(driverId);
    if (!update) {
        return await db.insertQuery(db.tables.drivers_status, {
            driver_id: driverId
        });
    } else {
        return update;
    }
}

/**
 * Return true if driver exists in status table
 * 
 * @param {*} driverId 
 */
var driverStatusExists = async function (driverId) {
    let data = {
        driver_id: driverId
    };
    let dbResult = await db.selectAllWhereLimitOne(db.tables.drivers_status, data);
    return dbResult.length > 0;
}

/**
 * End shift if driver doesn't have routes
 * Delete from drivers_status table
 * 
 * @param {*} driverId 
 */
var endShift = async function (driverId) {
    let routes = await Driver.getRoutes(driverId);
    if (routes.length == 0) {
        let sqlQuery = `
            UPDATE drivers_shift_history
            SET shift_end = CURRENT_TIMESTAMP
            WHERE ? AND shift_end IS NULL`

        let key = {
            driver_id: driverId
        };

        await db.runQuery(sqlQuery, key);
    }
}

/**
 * Check if should end the shift
 * End shift if driver requested to be offline
 * 
 * @param {*} driverId 
 */
var checkToEndShift = async function (driverId) {
    let started = await shiftStarted(driverId);
    let online = await isOnline(driverId);

    if (started && !online) {
        await endShift(driverId);
    }
}

/**
 * Check if driver is online
 * 
 * @param {*} driverId 
 */
var isOnline = async function (driverId) {
    var data = {
        driver_id: driverId
    };
    var driverStatus = await db.selectAllWhereLimitOne(db.tables.drivers_status, data);
    return (driverStatus.length > 0 && driverStatus[0].online);
}

pub.saveArrivedStore = function (orderIds) {
    return updateOrdersHistory("date_arrived_store", orderIds);
}

pub.savePickUp = function (orderIds) {
    return updateOrdersHistory("date_picked", orderIds);
}

pub.saveDropOff = async function (dropOff) {
    let orderId = dropOff.order_id;

    let updateData = {
        refused: dropOff.refused,
    };

    if (dropOff.same_receiver != true) {
        updateData.receiver_name = dropOff.receiver_name;
        updateData.receiver_age = dropOff.receiver_age;
    }

    let key = {
        id: orderId
    };

    let result = await db.updateQuery(db.tables.orders_history, [updateData, key]);

    if (result) {
        return updateOrdersHistory("date_delivered", [orderId]);
    } else {
        return false;
    }
}

pub.saveArrivedCustomer = async function (customerId, driverId) {
    let orderInfo = await Orders.getOrderArrayByCustomerId(customerId, driverId);
    let orderIds = [];

    if(orderInfo.length==0){
        return false;
    }

    for (order in orderInfo) {
        orderIds.push(orderInfo[order].id);
    }

    let name = orderInfo[0].fName;
    let phone = orderInfo[0].phone;

    SMS.notifyDriverArrival(phone, name);

    return updateOrdersHistory("date_arrived_customer", orderIds);
}

var updateOrdersHistory = async function (updateColumn, receivedOrderIds) {
    let orderIds = [];
    for (let i = 0; i < receivedOrderIds.length; i++) {
        orderIds.push(receivedOrderIds[i]);
    }
    let sqlQuery = `
        UPDATE orders_history
        SET `+ updateColumn + ` = CURRENT_TIMESTAMP
        WHERE id in (` + orderIds + `)`;

    return await db.runQuery(sqlQuery);
}

// Routes
/**
 * Place order and store to drivers_routes table
 * 
 * @param {*} driverId 
 * @param {*} storeId 
 * @param {*} orderId 
 * @param {*} nextNodeIdString 
 * @param {*} storeAdded 
 */
pub.dispatchOrder = async function (driverId, storeId, orderId, nextNodeIdString, storeAdded) {
    var orderInsertAt = await insertStoreToRoutes(driverId, storeId, nextNodeIdString, storeAdded);
    var orderData = {
        driver_id: driverId,
        order_id: orderId,
        position: orderInsertAt
    };

    await db.insertQuery(db.tables.drivers_routes, orderData);
}

/**
 * Get maximum position for driver
 * 
 * @param {*} driverId 
 */
var getRoutesMaxPosition = async function (driverId) {
    var data = { driver_id: driverId };
    var sqlQuery = `
        SELECT MAX(position) AS max_position
        FROM drivers_routes
        WHERE ?`;

    var maxPosition = await db.runQuery(sqlQuery, data);
    if (maxPosition[0].max_position == null) {
        return -1;
    } else {
        return maxPosition[0].max_position;
    }
}

/**
 * Shift routes to insert store
 * 
 * @param {*} driverId 
 * @param {*} nextNodeIdString 
 */
var shiftRoutes = async function (driverId, nextNodeIdString) {
    if (nextNodeIdString != -1) {
        let nextNodeType = nextNodeIdString.split("_")[0];
        let nextNodeId = nextNodeIdString.split("_")[1];

        let selectData = {};
        if (nextNodeType == "s") {
            selectData.store_id = nextNodeId;
        } else {
            selectData.order_id = nextNodeId;
        }

        let driverData = { driver_id: driverId };

        let sqlQuerySelect = `
            SELECT position
            FROM drivers_routes
            WHERE ? AND ?
            LIMIT 1`;

        let route = await db.runQuery(sqlQuerySelect, [driverData, selectData]);

        let sqlQuery = `
            UPDATE drivers_routes
            SET position = position + 1
            WHERE ? AND position >= ` + route[0].position;


        await db.runQuery(sqlQuery, driverData);
        return route[0].position;
    } else {
        let maxPosition = await getRoutesMaxPosition(driverId);
        return maxPosition + 1;
    }
}

/**
 * Insert store to drivers_routes table
 * 
 * @param {*} driverId 
 * @param {*} storeId 
 * @param {*} nextNodeIdString 
 * @param {*} storeAdded 
 */
var insertStoreToRoutes = async function (driverId, storeId, nextNodeIdString, storeAdded) {
    if (storeAdded) {
        let positionToInsert = await shiftRoutes(driverId, nextNodeIdString);
        let storeData = {
            driver_id: driverId,
            store_id: storeId,
            position: positionToInsert
        };

        await db.insertQuery(db.tables.drivers_routes, storeData);
    }
    let maxPosition = await getRoutesMaxPosition(driverId);
    return maxPosition + 1;
}

/**
 * Remove route node and update positions
 * 
 * @param {*} driverId 
 * @param {*} data 
 */
var removeRouteNode = async function (driverId, data) {
    let sqlQuerySelect = `
        SELECT id, position
        FROM drivers_routes
        WHERE driver_id = `+ driverId + ` AND ?
        LIMIT 1`;

    let route = await db.runQuery(sqlQuerySelect, data);
    let deleteData = { id: route[0].id };
    let result2 = await db.deleteQuery(db.tables.drivers_routes, deleteData);

    let sqlQuery = `
        UPDATE drivers_routes
        SET position = position - 1
        WHERE ? AND position >= ` + route[0].position;
    let driverData = { driver_id: driverId };
    let result1 = await db.runQuery(sqlQuery, driverData);

    return (result1 && result2);
}

/**
 * Remove store route node from routes
 * 
 * @param {*} driverId 
 * @param {*} storeId 
 */
pub.removeStoreRouteNode = async function (driverId, storeId) {
    let storeData = { store_id: storeId };

    return await removeRouteNode(driverId, storeData);
}

/**
 * Remove order route node from routes
 * 
 * @param {*} driverId 
 * @param {*} orderId 
 */
pub.removeOrderRouteNode = async function (driverId, orderId) {
    let orderData = { order_id: orderId };

    let result = await removeRouteNode(driverId, orderData);
    await checkToEndShift(driverId);

    return result;
}

/**
 * Get driver's route nodes
 * 
 * @param {*} driverId 
 */
pub.getRoutes = async function (driverId) {
    let sqlQuery = `
        SELECT routes.id AS route_id, routes.position AS position, history.id_prefix AS node_id_prefix,
        routes.order_id AS node_id, transaction.delivery_address AS node_address, "order" AS node_type,
        transaction.delivery_latitude AS node_latitude, transaction.delivery_longitude AS node_longitude
        FROM drivers_routes AS routes,
        orders_history AS history,
        orders_transactions_history AS transaction
        WHERE 
        transaction.id = history.order_transaction_id
        AND routes.order_id = history.id
        AND ? 
        
        UNION
        
        SELECT routes.id AS route_id, routes.position AS position, stores.id_prefix AS node_id_prefix, routes.store_id AS node_id, stores.address AS node_address, "store" AS node_type,
        stores.address_latitude AS node_latitude, stores.address_longitude AS node_longitude
        FROM drivers_routes AS routes,
        catalog_stores AS stores
        WHERE 
        routes.store_id = stores.id
        AND ?
        
        ORDER BY position`;

    let data = {
        "routes.driver_id": driverId
    };

    let routes = await db.runQuery(sqlQuery, [data, data]);
    return routes;
}

pub.getDriverObject = async function (driverId) {
    let data = { id: driverId };

    let driver = await db.selectAllWhereLimitOne(db.tables.drivers, data);
    let driverStatus = await Driver.getDriverStatus(driverId);

    return sanitizeDriverObject(Object.assign({}, driver[0], driverStatus));
}

/**
 * Get drivers routes with orders for driver id
 * 
 * @param {*} driverId 
 */
pub.getDriversRoutes = async function (driverId) {
    // get routes
    let sqlQuery = `
        SELECT * FROM drivers_routes
        WHERE ?
        ORDER BY position;`;

    let data = { driver_id: driverId };

    let routes = await db.runQuery(sqlQuery, data);

    let result = [];
    for (let i = 0; i < routes.length; i++) {
        if (routes[i].store_id) {
            let tmpStore = await Store.getStoreInfo(routes[i].store_id);
            tmpStore.is_store = true;
            result.push(tmpStore);
        } else {
            let tmpUserWithOrder = await Orders.getUserWithOrderByOrderId(routes[i].order_id);
            let tmpUser = tmpUserWithOrder.user;
            let tmpTransaction = tmpUserWithOrder.transaction;
            let tmpOrder = tmpUserWithOrder.order;

            let products = await Orders.getOrderItemsById(tmpOrder.id);

            let customer = {
                id: tmpUser.id_prefix + tmpUser.id,
                first_name: tmpUser.first_name,
                last_name: tmpUser.last_name
            };

            let tmpOrderNode = {
                is_store: false,
                customer: customer,
                delivery_address: tmpTransaction.delivery_address,
                delivery_latitude: tmpTransaction.delivery_latitude,
                delivery_longitude: tmpTransaction.delivery_longitude,
                phone_number: tmpTransaction.phone_number,
                driver_instruction: tmpTransaction.driver_instruction,
                store_id: tmpOrder.store_id,
                order_id: tmpOrder.id,
                date_arrived_store: tmpOrder.date_arrived_store,
                date_arrived_customer: tmpOrder.date_arrived_customer,
                products: products
            };

            result.push(tmpOrderNode);
        }
    }

    return result;
}

var sanitizeDriverObject = function(driver){    
    let obj = Object.assign({}, driver);

    delete obj.id_prefix;
    delete obj.password;
    delete obj.sin_number;

    return obj;
}

module.exports = pub;
