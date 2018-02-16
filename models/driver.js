/**
 * @copyright Homit 2018
 */

var fs = require("fs");
const path = require('path');
var KEY_PATH = path.normalize(process.cwd() + "/ssl/server.enc.key");
var CERTIFICATE_PATH = path.normalize(process.cwd() + "/ssl/server.crt");
var sockIOServer = require("https").createServer({
    key: fs.readFileSync(KEY_PATH),
    cert: fs.readFileSync(CERTIFICATE_PATH),
    passphrase: 'test'
});

var io = require("socket.io")(sockIOServer, {
    pingInterval: 2100,
    pingTimeout: 2000
});
var driverConnector = require("net");
var pub = {};
var driverConnections = {};
var driverTempStorage = {};
var SOCKET_PORT = 3000;
var DEFAULT_EMIT = "data";

/* Building metadata for log */
var logMeta = {
    directory: __filename
}

io.on("connection", function (socket) {
    Logger.log.verbose(socket.id + " app has been connected to server", logMeta);
    socket.isVerified = false;

    setTimeout(function () {
        if (!socket.isVerified) {
            socket.disconnect();
        }
    }, 5000);

    var conInfo = {
        driver_id: "",
        port: SOCKET_PORT,
        socket: socket
    };
    driverConnections[socket.id] = conInfo;

    socket.on("verify", async function (data) {
        // Put status table
        var receivedJson = JSON.parse(data);
        var tokenData = JWTToken.validateToken(receivedJson.token);
        if (!tokenData || tokenData.driver_id != receivedJson.driver_id) {
            socket.disconnect();
        } else {
            socket.isVerified = true;
            driverConnections[socket.id].driver_id = tokenData.driver_id;
            await updateDriverStatusConnected(tokenData.driver_id, socket.id);
            if (driverTempStorage[tokenData.driver_id]) {
                for (var i = 0; i < driverTempStorage[tokenData.driver_id].length; i++) {
                    Driver.send(tokenData.driver_id, driverTempStorage[tokenData.driver_id][i]);
                }
                driverTempStorage[tokenData.driver_id] = [];
            }

            var requests = await getDriversRequest(tokenData.driver_id);

            // TODO: Chingiz uncommenct this
            // for (var i = 0; i < requests.length; i++) {
            //     Driver.send(requests[i].driver_id,  JSON.parse(requests[i].order_info));
            // }
        }
    });

    socket.on("data", function (data) {
        if (!socket.isVerified) {
            socket.disconnect();
        }
        var receivedJson = JSON.parse(data);
        Logger.log.verbose("--------------------------------------------------------");
        Logger.log.verbose(receivedJson);
        Logger.log.verbose("--------------------------------------------------------");
        if (receivedJson.action == "driver_status") {
            var driverDetails = receivedJson.details;
            var driverIdString = driverDetails.driver_id;
            var driverIdInt = driverIdString.split("_")[1];
            var sendToCm = true;
            switch (driverDetails.status) {
                case "online":
                    saveOnline(driverIdInt);
                    updateLocation(driverIdInt, driverDetails.location);
                    break;
                case "offline":
                    saveOffline(driverIdInt);
                    break;
                case "arrived_store":
                    Logger.log.verbose("Data received from driver: arrived_store");
                    Logger.log.verbose("store_id: " + driverDetails.arrived_store.store_id);
                    Logger.log.verbose("order_ids: " + driverDetails.arrived_store.order_ids + "\n");
                    saveArrivedStore(driverIdInt, driverDetails.arrived_store.order_ids);
                    removeStoreRouteNode(driverIdInt, driverDetails.arrived_store.store_id);
                    break;
                case "pick_up":
                    Logger.log.verbose("Data received from driver: pick_up");
                    Logger.log.verbose("store_id: " + driverDetails.pick_up.store_id);
                    Logger.log.verbose("order_ids: " + driverDetails.pick_up.order_ids + "\n");
                    savePickUp(driverIdInt, driverDetails.pick_up.order_ids);
                    break;
                case "drop_off":
                    Logger.log.verbose("Data received from driver: drop_off");
                    Logger.log.verbose("order_id: " + driverDetails.drop_off.order_id);
                    Logger.log.verbose("refused: " + driverDetails.drop_off.refused);
                    Logger.log.verbose("same_receiver: " + driverDetails.drop_off.same_receiver);
                    Logger.log.verbose("receiver_name: " + driverDetails.drop_off.receiver_name);
                    Logger.log.verbose("receiver_age: " + driverDetails.drop_off.receiver_age + "\n");
                    removeOrderRouteNode(driverIdInt, driverDetails.drop_off.order_id);
                    saveDropOff(driverIdInt, driverDetails.drop_off);
                    break;
                case "location_update":
                    updateLocation(driverIdInt, driverDetails.location);
                    break;
                case "arrived_customer":
                    Logger.log.verbose("Data received from driver: arrived_customer");
                    Logger.log.verbose("customer_id: " + driverDetails.arrived_customer.customer_id);
                    Logger.log.verbose("order_ids: " + driverDetails.arrived_customer.order_ids + "\n");
                    saveArrivedCustomer(driverIdInt, driverDetails.arrived_customer.order_ids, driverDetails.arrived_customer.customer_id);
                    sendToCm = false;
                    break;
                default:
                    Logger.log.error("Wrong 'status' received from driver app. Received data: " + receivedJson.stringify(), logMeta);
            }
            if (sendToCm) {
                CM.send(receivedJson);
            }
        } else {
            Logger.log.error("Wrong 'action' received from driver app. Received data: " + receivedJson.stringify(), logMeta);
        }
    });

    socket.on("disconnect", function () {
        updateDriverStatusDisconnected(socket.id);
        delete driverConnections[socket.id];
        Logger.log.verbose(socket.id + " app has been disconnected from server", logMeta);
    });

    socket.on("connect_error", function (data) {
        Logger.log.verbose("Connect error has been occurred " + data, logMeta);
    });

    socket.on("connect_timeout", function (data) {
        Logger.log.verbose("Conenction timeout with driver has been occurred " + data, logMeta);
    });

    socket.on("error", function (data) {
        Logger.log.error("Conenction error with driver occurred " + data, logMeta);
    });
});

try {
    sockIOServer.listen(SOCKET_PORT);
} catch (err) {
    Logger.log.error("Can't listen to port " + SOCKET_PORT + "Please close other apps that might be using the same port", logMeta);
}

pub.findDriver = function (email) {
    var data = { user_email: email };
    return db.selectAllWhere(db.dbTables.drivers, data).then(function (dbResult) {
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
    return db.selectAllWhere(db.dbTables.drivers, data).then(function (dbResult) {
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
    return db.selectAllWhere(db.dbTables.drivers, data).then(function (driver) {
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

/* Get connection info for driver */
pub.getConnectionPort = function () {
    //TODO: Why not remove this method
    return 443;
}

pub.send = async function (id, json) {
    var driverId = id.split("_")[1];
    var driverConnected = await isConnected(driverId);
    var driverConnectedOld = false;
    for (var sockId in driverConnections) {
        if (driverConnections[sockId].driver_id == id) {
            driverConnections[sockId].socket.emit(DEFAULT_EMIT, JSON.stringify(json) + "\n");
            driverConnectedOld = true;
            Logger.log.verbose("Sending order to " + id);
            break;
        }
    }

    if (!driverConnectedOld) {
        if (!driverTempStorage[id]) {
            driverTempStorage[id] = [];
        }
        driverTempStorage[id].push(json);
        Logger.log.warn("Could not send order to offline driver " + id);
    }

    if (!driverConnected) {
        await addToDriversRequest(driverId, json);
        var driverInfo = await Driver.findDriverById(driverId);
        SMS.notifyDriver("Your app is disconnected and you have been dispatched for an order " +
            json.details.customer.order.id,
            driverInfo.first_name, driverInfo.phone_number, function response() { });
    }
}

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
    Driver.send(driverId, json);
}

pub.getOnlineDrivers = async function () {
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

    var onlineDrivers = await db.runQuery(sqlQuery);
    return onlineDrivers;
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
    var dbResult = await db.selectAllWhere(db.dbTables.drivers_status, data);
    return dbResult.length > 0;
}

/**
 * Update driver status table when driver is connected
 * 
 * @param {*} driverId 
 * @param {*} socketId 
 */
var updateDriverStatusConnected = async function (driverId, socketId) {
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
        await db.updateQuery(db.dbTables.drivers_status, [dataUpdate, data]);
    } else {
        Logger.log.info("Inserting driver status for driver: " + driverId);
        data.socket_id = socketId;
        await db.insertQuery(db.dbTables.drivers_status, data);
    }
}

/**
 * Update driver status table when driver is disconnected
 * 
 * @param {*} socketId 
 */
var updateDriverStatusDisconnected = async function (driverId) {
    var key = {
        driver_id: driverId
    };
    var dataUpdate = {
        connected: false
    };
    await db.updateQuery(db.dbTables.drivers_status, [dataUpdate, key]);
}

var isConnected = async function (driverId) {
    var data = {
        driver_id: driverId
    };
    var driverStatus = await db.selectAllWhere(db.dbTables.drivers_status, data);
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
        AND ?`
    var data = { driver_id: driverId };
    var dbResult = await db.runQuery(sqlQuery, data);
    return dbResult != 0;
}

/**
 * Start driver's schedule and set the online flag
 * 
 * @param {*} driverId 
 */
var saveOnline = async function (driverId) {
    var started = await shiftStarted(driverId);
    if (!started) {
        var data = { driver_id: driverId };
        await db.insertQuery(db.dbTables.drivers_shift_history, data);
    }

    await setDriverOnlineFlag(driverId, true);
}

/**
 * Set the driver's flag to offline.
 * End shift if driver doesn't have any orders.
 * 
 * @param {*} driverId 
 */
var saveOffline = async function (driverId) {
    await setDriverOnlineFlag(driverId, false);
    await endShift(driverId);
}

/**
 * Update driver's location in drivers_status table
 * 
 * @param {*} driverId 
 * @param {*} location 
 */
var updateLocation = async function (driverId, location) {
    var updateData = {
        longitude: location.longitude,
        latitude: location.latitude
    };
    var key = {
        driver_id: driverId
    };

    await db.updateQuery(db.dbTables.drivers_status, [updateData, key]);
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
    await db.updateQuery(db.dbTables.drivers_status, [data, key]);
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
        await db.deleteQuery(db.dbTables.drivers_status, key);
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
    var driverStatus = await db.selectAllWhere(db.dbTables.drivers_status, data);
    return (driverStatus.length > 0 && driverStatus[0].online);
}

// Orders history
var saveArrivedStore = function (driverId, orderIds) {
    updateOrdersHistory("date_arrived_store", orderIds);
}

var savePickUp = function (driverId, orderIds) {
    updateOrdersHistory("date_picked", orderIds);
}

var saveDropOff = async function (driverId, dropOff) {
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

    await db.updateQuery(db.dbTables.orders_history, [updateData, key]);
    updateOrdersHistory("date_delivered", [orderIdString]);
}

var saveArrivedCustomer = async function (driverId, orderIds, customerIdString) {
    var customerInit = customerIdString.split("_")[0];
    var customerId = customerIdString.split("_")[1];

    var customer;
    if (customerInit == "u") {
        customer = await User.findUserById(customerId);
    } else {
        customer = await User.findGuestUserById(customerId);
    }

    var name = customer.first_name + " " + customer.last_name;
    var phone = customer.phone_number;
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

    await db.insertQuery(db.dbTables.drivers_routes, orderData);
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
            WHERE ? AND ?`;

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

        await db.insertQuery(db.dbTables.drivers_routes, storeData);
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
        WHERE driver_id = `+ driverId + ` AND ?`;

    var route = await db.runQuery(sqlQuerySelect, data);
    var deleteData = { id: route[0].id };

    await db.deleteQuery(db.dbTables.drivers_routes, deleteData);

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
var removeStoreRouteNode = async function (driverId, storeId) {
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
var removeOrderRouteNode = async function (driverId, orderId) {
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
        routes.order_id AS node_id, history.delivery_address AS node_address, "order" AS node_type,
        history.delivery_latitude AS node_latitude, history.delivery_longitude AS node_longitude
        FROM drivers_routes AS routes,
        orders_history AS history
        WHERE 
        routes.order_id = history.id
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

    var routes = await db.runQuery(sqlQuery, data);
    return routes;
}

// Drivers temp request

/**
 * Add to drivers request temp holder
 * 
 * @param {*} driverId 
 * @param {*} json 
 */
var addToDriversRequest = async function (driverId, json) {
    var data = {
        driver_id: driverId,
        order_info: JSON.stringify(json)
    };

    await db.insertQuery(db.dbTables.drivers_request, data);
}

/**
 * Get drivers request temp holder
 * 
 * @param {*} driverId 
 */
var getDriversRequest = async function (driverId) {
    var data = {
        driver_id: driverId
    };

    var requests = await db.selectAllWhere(db.dbTables.drivers_request, data);
    await db.deleteQuery(db.dbTables.drivers_request, data);
    return requests;
}

module.exports = pub;
