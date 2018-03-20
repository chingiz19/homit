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

/* Authenticate driver */
pub.authenticateDriver = function (email, password) {
    var data = { user_email: email };
    return db.selectAllWhereLimitOne(db.tables.drivers, data).then(function (driver) {
        if (driver.length > 0) {
            return Auth.comparePassword(password, driver[0].password).then(function (match) {
                if (match) {
                    return User.sanitizeUserObject(driver[0]);
                } else {
                    return false;
                }
            });
        } else {
            return false;
        }
    });
};

pub.cancelOrder = function (orderId, driverId) {
    var driverIdString = "d_" + driverId;
    var orderIdString = "o_" + orderId;

    var json = {
        "action": "delete",
        "details": {
            "order": {
                "id": orderIdString
            }
        }
    };
    NM.sendToDriver(driverId, json);
}

pub.getActiveDrivers = async function () {
    var sqlQuery = `
        SELECT
        drivers.id AS driver_id,
        drivers.id_prefix AS driver_id_prefix,
        drivers.user_email,
        drivers.first_name,
        drivers.last_name,
        drivers.phone_number,
        status.socket_id,
        status.latitude,
        status.longitude,
        status.online,
        status.connected
        
        FROM drivers, drivers_status AS status
        WHERE drivers.id = status.driver_id
    `;

    var activeDrivers = await db.runQuery(sqlQuery);
    return activeDrivers;
}

/**
 * Return true if driver exists in status table
 * 
 * @param {*} driverId 
 */
var driverStatusExists = async function (driverId) {
    var data = {
        driver_id: driverId
    };
    var dbResult = await db.selectAllWhereLimitOne(db.tables.drivers_status, data);
    return dbResult.length > 0;
}

/**
 * Update driver status table when driver is connected
 * 
 * @param {*} driverId 
 * @param {*} socketId 
 */
pub.updateDriverStatusConnected = async function (driverId, socketId) {
    var update = await driverStatusExists(driverId);
    var data = {
        driver_id: driverId
    };
    if (update) {
        Logger.log.info("Updating driver status for driver: " + driverId);
        var dataUpdate = {
            socket_id: socketId,
            connected: true
        };
        await db.updateQuery(db.tables.drivers_status, [dataUpdate, data]);
    } else {
        Logger.log.info("Inserting driver status for driver: " + driverId);
        data.socket_id = socketId;
        await db.insertQuery(db.tables.drivers_status, data);
    }
}

/**
 * Update driver status table when driver is disconnected
 * 
 * @param {*} socketId 
 */
pub.updateDriverStatusDisconnected = async function (socketId) {
    var key = {
        socket_id: socketId
    };

    var driverStatus = await db.selectAllWhereLimitOne(db.tables.drivers_status, key);
    var driverId = driverStatus[0].driver_id;

    var started = await shiftStarted(driverId);
    var online = await isOnline(driverId);

    if (!online && !started) {
        await db.deleteQuery(db.tables.drivers_status, key);
    } else {
        var dataUpdate = {
            connected: false
        };
        await db.updateQuery(db.tables.drivers_status, [dataUpdate, key]);
    }
}

pub.isConnected = async function (driverId) {
    var data = {
        driver_id: driverId
    };
    var driverStatus = await db.selectAllWhereLimitOne(db.tables.drivers_status, data);
    return (driverStatus.length > 0 && driverStatus[0].connected);
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
    var data = { driver_id: driverId };
    var dbResult = await db.runQuery(sqlQuery, data);
    return dbResult.length != 0;
}

/**
 * Start driver's schedule and set the online flag
 * 
 * @param {*} driverId 
 */
pub.saveOnline = async function (driverId) {
    var started = await shiftStarted(driverId);
    if (!started) {
        var data = { driver_id: driverId };
        await db.insertQuery(db.tables.drivers_shift_history, data);
    }

    await setDriverOnlineFlag(driverId, true);
}

/**
 * Set the driver's flag to offline.
 * End shift if driver doesn't have any orders.
 * 
 * @param {*} driverId 
 */
pub.saveOffline = async function (driverId) {
    await setDriverOnlineFlag(driverId, false);
    await endShift(driverId);
}

/**
 * Update driver's location in drivers_status table
 * 
 * @param {*} driverId 
 * @param {*} location 
 */
pub.updateLocation = async function (driverId, location) {
    var updateData = {
        longitude: location.longitude,
        latitude: location.latitude
    };
    var key = {
        driver_id: driverId
    };

    await db.updateQuery(db.tables.drivers_status, [updateData, key]);
}

/**
 * Set driver flag in drivers_status table
 * 
 * @param {*} driverId 
 * @param {*} status 
 */
var setDriverOnlineFlag = async function (driverId, status) {
    var data = {
        online: status
    };
    var key = {
        driver_id: driverId
    };
    await db.updateQuery(db.tables.drivers_status, [data, key]);
}

/**
 * End shift if driver doesn't have routes
 * Delete from drivers_status table
 * 
 * @param {*} driverId 
 */
var endShift = async function (driverId) {
    var routes = await Driver.getRoutes(driverId);
    if (routes.length == 0) {
        var sqlQuery = `
            UPDATE drivers_shift_history
            SET shift_end = CURRENT_TIMESTAMP
            WHERE ? AND shift_end IS NULL`

        var key = {
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
    var started = await shiftStarted(driverId);
    var online = await isOnline(driverId);

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

// Orders history
pub.saveArrivedStore = function (driverId, orderIds) {
    updateOrdersHistory("date_arrived_store", orderIds);
}

pub.savePickUp = function (driverId, orderIds) {
    updateOrdersHistory("date_picked", orderIds);
}

pub.saveDropOff = async function (driverId, dropOff) {
    var orderIdString = dropOff.order_id;
    var orderId = orderIdString.split("_")[1];

    var updateData = {
        refused: dropOff.refused,
    };

    if (dropOff.same_receiver != true) {
        updateData.receiver_name = dropOff.receiver_name;
        updateData.receiver_age = dropOff.receiver_age;
    }

    var key = {
        id: orderId
    };

    await db.updateQuery(db.tables.orders_history, [updateData, key]);
    updateOrdersHistory("date_delivered", [orderIdString]);
}

pub.saveArrivedCustomer = async function (driverId, orderIds) {
    var orderInfo = await getUserWithOrderByOrderId(orderIdsString[0].split("_")[1]);
    var name = orderInfo.user.first_name;
    var phone = orderInfo.transaction.phone_number;

    SMS.notifyDriverArrival(phone, name);
    updateOrdersHistory("date_arrived_customer", orderIds);
}

var updateOrdersHistory = async function (updateColumn, orderIdsString) {
    var orderIds = [];
    for (var i = 0; i < orderIdsString.length; i++) {
        orderIds.push(orderIdsString[i].split("_")[1]);
    }
    var sqlQuery = `
        UPDATE orders_history
        SET `+ updateColumn + ` = CURRENT_TIMESTAMP
        WHERE id in (` + orderIds + `)`;

    await db.runQuery(sqlQuery);
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
        var nextNodeType = nextNodeIdString.split("_")[0];
        var nextNodeId = nextNodeIdString.split("_")[1];

        var selectData = {};
        if (nextNodeType == "s") {
            selectData.store_id = nextNodeId;
        } else {
            selectData.order_id = nextNodeId;
        }

        var driverData = { driver_id: driverId };

        var sqlQuerySelect = `
            SELECT position
            FROM drivers_routes
            WHERE ? AND ?
            LIMIT 1`;

        var route = await db.runQuery(sqlQuerySelect, [driverData, selectData]);

        var sqlQuery = `
            UPDATE drivers_routes
            SET position = position + 1
            WHERE ? AND position >= ` + route[0].position;


        await db.runQuery(sqlQuery, driverData);
        return route[0].position;
    } else {
        var maxPosition = await getRoutesMaxPosition(driverId);
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
        var positionToInsert = await shiftRoutes(driverId, nextNodeIdString);
        var storeData = {
            driver_id: driverId,
            store_id: storeId,
            position: positionToInsert
        };

        await db.insertQuery(db.tables.drivers_routes, storeData);
    }
    var maxPosition = await getRoutesMaxPosition(driverId);
    return maxPosition + 1;
}

/**
 * Remove route node and update positions
 * 
 * @param {*} driverId 
 * @param {*} data 
 */
var removeRouteNode = async function (driverId, data) {
    var sqlQuerySelect = `
        SELECT id, position
        FROM drivers_routes
        WHERE driver_id = `+ driverId + ` AND ?
        LIMIT 1`;

    var route = await db.runQuery(sqlQuerySelect, data);
    var deleteData = { id: route[0].id };

    await db.deleteQuery(db.tables.drivers_routes, deleteData);

    var sqlQuery = `
        UPDATE drivers_routes
        SET position = position - 1
        WHERE ? AND position >= ` + route[0].position;
    var driverData = { driver_id: driverId };
    await db.runQuery(sqlQuery, driverData);
}

/**
 * Remove store route node from routes
 * 
 * @param {*} driverId 
 * @param {*} storeId 
 */
pub.removeStoreRouteNode = async function (driverId, storeId) {
    var storeIdInt = storeId.split("_")[1];
    var storeData = { store_id: storeIdInt };

    await removeRouteNode(driverId, storeData);
}

/**
 * Remove order route node from routes
 * 
 * @param {*} driverId 
 * @param {*} orderId 
 */
pub.removeOrderRouteNode = async function (driverId, orderId) {
    var orderIdInt = orderId.split("_")[1];
    var orderData = { order_id: orderIdInt };

    await removeRouteNode(driverId, orderData);
    await checkToEndShift(driverId);
}

/**
 * Get driver's route nodes
 * 
 * @param {*} driverId 
 */
pub.getRoutes = async function (driverId) {
    var sqlQuery = `
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

    var data = {
        "routes.driver_id": driverId
    };

    var routes = await db.runQuery(sqlQuery, [data, data]);
    return routes;
}

// Drivers temp request

/**
 * Add to drivers request temp holder
 * 
 * @param {*} driverId 
 * @param {*} json 
 */
pub.addToDriversRequest = async function (driverId, json) {
    var data = {
        driver_id: driverId,
        order_info: JSON.stringify(json)
    };

    await db.insertQuery(db.tables.drivers_request, data);
}

/**
 * Get drivers request temp holder
 * 
 * @param {*} driverId 
 */
pub.getDriversRequest = async function (driverId) {
    var data = {
        driver_id: driverId
    };

    var requests = await db.selectAllWhere(db.tables.drivers_request, data);
    await db.deleteQuery(db.tables.drivers_request, data);
    return requests;
}

module.exports = pub;
