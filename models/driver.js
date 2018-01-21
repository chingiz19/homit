/**
 * @copyright Homit 2018
 */

var sockIOServer = require("http").createServer();
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

    socket.on("verify", function (data) {
        var receivedJson = JSON.parse(data);
        var tokenData = JWTToken.validateToken(receivedJson.token);
        if (!tokenData || tokenData.driver_id != receivedJson.driver_id) {
            socket.disconnect();
        } else {
            socket.isVerified = true;
            driverConnections[socket.id].driver_id = tokenData.driver_id;
            if (driverTempStorage[tokenData.driver_id]) {
                for (var i = 0; i < driverTempStorage[tokenData.driver_id].length; i++) {
                    Driver.send(tokenData.driver_id, driverTempStorage[tokenData.driver_id][i]);
                }
                driverTempStorage[tokenData.driver_id] = [];
            }
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
                    saveLocation(driverIdInt, driverDetails.location);
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
                    saveLocation(driverIdInt, driverDetails.location);
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
        delete driverConnections[socket.id];
        Logger.log.verbose(socket.id + " app has been disconnected from server");
    });

    socket.on("connect_error", function (data) {
        Logger.log.verbose("Connect error has been occurred " + data);
    });

    socket.on("connect_timeout", function (data) {
        Logger.log.verbose("Conenction timeout with driver has been occurred " + data);
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
    return SOCKET_PORT;
};

pub.send = function (id, json) {
    var driverOffline = true;
    for (var sockId in driverConnections) {
        if (driverConnections[sockId].driver_id == id) {
            driverConnections[sockId].socket.emit(DEFAULT_EMIT, JSON.stringify(json) + "\n");
            driverOffline = false;
            break;
        }
    }

    if (driverOffline) {
        if (!driverTempStorage[id]) {
            driverTempStorage[id] = [];
        }
        driverTempStorage[id].push(json);
    }
};

var saveOnline = function (driverId) {
    var sqlQuery = `
    SELECT * FROM drivers_shift_history WHERE shift_end = 0    
    AND ?`

    var data = { "driver_id": driverId };
    return db.runQuery(sqlQuery, data).then(function (dbResult) {
        if (dbResult.length == 0) {
            insertData = {
                driver_id: driverId
            };
            return db.insertQuery(db.dbTables.drivers_shift_history, insertData).then(function (inserted) {
                return inserted.insertId;
            });
        } else {
            return setDriverOnlineFlag(dbResult[0].id, true).then(function (updated) {
                return true;
            });
        }
    });
};

var saveOffline = function (driverId) {
    var sqlQuery = `
    SELECT * FROM drivers_shift_history WHERE shift_end = 0    
    AND ?`

    var data = { "driver_id": driverId };
    return db.runQuery(sqlQuery, data).then(function (dbResult) {
        if (dbResult.length > 0) {

            return setDriverOnlineFlag(dbResult[0].id, false).then(function (updated) {
                return endShift(dbResult[0].id, driverId).then(function (ended) {
                    return true;
                });
            });
        }
    });
};

var saveArrivedStore = function (driverId, orderIds) {
    updateOrdersHistory("date_arrived_store", orderIds);
};

var savePickUp = function (driverId, orderIds) {
    updateOrdersHistory("date_picked", orderIds);
};

var saveDropOff = function (driverId, dropOff) {
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

    return db.updateQuery(db.dbTables.orders_history, [updateData, key]).then(function (updated) {
        updateOrdersHistory("date_delivered", [orderIdString]);
    });
};

var saveArrivedCustomer = function (driverId, orderIds, customerIdString) {
    var customerInit = customerIdString.split("_")[0];
    var customerId = customerIdString.split("_")[1];
    if (customerInit == "u") {
        User.findUserById(customerId).then(function (customer) {
            var name = customer.first_name + " " + customer.last_name;
            var phone = customer.phone_number;
            SMS.notifyDriverArrival(phone, name);
            updateOrdersHistory("date_arrived_customer", orderIds);
        });
    } else {
        User.findGuestUserById(customerId).then(function (customer) {
            var name = customer.first_name + " " + customer.last_name;
            var phone = customer.phone_number;
            SMS.notifyDriverArrival(phone, name);
            updateOrdersHistory("date_arrived_customer", orderIds);
        });
    }

};

var updateOrdersHistory = function (updateColumn, orderIdsString) {
    var orderIds = [];
    for (var i = 0; i < orderIdsString.length; i++) {
        orderIds.push(orderIdsString[i].split("_")[1]);
    }
    var sqlQuery = `
    UPDATE orders_history
    SET `+ updateColumn + ` = CURRENT_TIMESTAMP
    WHERE id in (` + orderIds + `)`;

    return db.runQuery(sqlQuery).then(function (updated) {
        return updated;
    });
};

var saveLocation = function (driverId, location) {
    var data = { driver_id: driverId };
    return db.selectAllWhere(db.dbTables.drivers_location, data).then(function (dbResult) {
        if (dbResult.length > 0) {
            var updateData = {
                longitude: location.longitude,
                latitude: location.latitude
            };
            var key = {
                driver_id: driverId
            };

            return db.updateQuery(db.dbTables.drivers_location, [updateData, key]).then(function (updated) {
                return updated;
            });
        } else {
            var insertData = {
                driver_id: driverId,
                longitude: location.longitude,
                latitude: location.latitude
            };

            return db.insertQuery(db.dbTables.drivers_location, insertData).then(function (inserted) {
                return inserted;
            });
        }
    });
};

pub.getOnlineDrivers = function () {
    var sqlQuery = `
    SELECT drivers.id AS driver_id, drivers.id_prefix AS driver_id_prefix,
    drivers.user_email AS email, drivers.first_name AS first_name,
    drivers.last_name AS last_name, drivers.phone_number AS phone_number,
    location.latitude AS latitude, location.longitude AS longitude,
    shift.shift_start AS shift_start, shift.online AS is_online
    FROM 
    drivers_shift_history AS shift,
    drivers,
    drivers_location AS location
    WHERE
    shift.shift_end = 0
    AND drivers.id = shift.driver_id
    AND drivers.id = location.driver_id
    `;

    return db.runQuery(sqlQuery).then(function (onlineDrivers) {
        return onlineDrivers;
    });
};

var getRoutesMaxPosition = function (driverId) {
    var data = { driver_id: driverId };
    var sqlQuery = `
        SELECT MAX(position) AS max_position
        FROM drivers_routes
        WHERE ?`;

    return db.runQuery(sqlQuery, data).then(function (maxPosition) {
        if (maxPosition[0].max_position == null) {
            return -1;
        } else {
            return maxPosition[0].max_position;
        }
    });
};

var shiftRoutes = function (driverId, nextNodeIdString) {
    if (nextNodeIdString != -1) {
        var nextNodeType = nextNodeIdString.split("_")[0];
        var nextNodeId = nextNodeIdString.split("_")[1];

        var selectData = {};
        if (nextNodeType == "s") {
            selectData.store_id = nextNodeId;
        } else {
            selectData.order_id = nextNodeId;
        }

        var sqlQuerySelect = `
            SELECT position
            FROM drivers_routes
            WHERE driver_id = `+ driverId + ` AND ?`;
        return db.runQuery(sqlQuerySelect, selectData).then(function (route) {
            var sqlQuery = `
                    UPDATE drivers_routes
                    SET position = position + 1
                    WHERE ? AND position >= ` + route[0].position;

            var driverData = { driver_id: driverId };

            return db.runQuery(sqlQuery, driverData).then(function (updatedPosition) {
                return route[0].position;
            });
        });
    } else {
        return getRoutesMaxPosition(driverId).then(function (maxPosition) {
            return maxPosition + 1;
        });
    }
};

var insertStoreToRoutes = function (driverId, storeId, nextNodeIdString, storeAdded) {
    if (storeAdded) {
        return shiftRoutes(driverId, nextNodeIdString).then(function (positionToInsert) {
            var storeData = {
                driver_id: driverId,
                store_id: storeId,
                position: positionToInsert
            };

            return db.insertQuery(db.dbTables.drivers_routes, storeData).then(function (insertedStore) {
                return getRoutesMaxPosition(driverId).then(function (maxPosition) {
                    return maxPosition + 1;
                });
            });
        });
    } else {
        return getRoutesMaxPosition(driverId).then(function (maxPosition) {
            return maxPosition + 1;
        });
    }
};

pub.dispatchOrder = function (driverId, storeId, orderId, nextNodeIdString, storeAdded) {
    return insertStoreToRoutes(driverId, storeId, nextNodeIdString, storeAdded).then(function (orderInsertAt) {
        var orderData = {
            driver_id: driverId,
            order_id: orderId,
            position: orderInsertAt
        };

        return db.insertQuery(db.dbTables.drivers_routes, orderData).then(function (dispatched) {
            return dispatched;
        });
    });
};

var removeRouteNode = function (driverId, data) {
    var sqlQuerySelect = `
        SELECT id, position
        FROM drivers_routes
        WHERE driver_id = `+ driverId + ` AND ?`;

    return db.runQuery(sqlQuerySelect, data).then(function (route) {
        var deleteData = { id: route[0].id };
        return db.deleteQuery(db.dbTables.drivers_routes, deleteData).then(function (deleted) {
            var sqlQuery = `
                UPDATE drivers_routes
                SET position = position - 1
                WHERE ? AND position >= ` + route[0].position;

            var driverData = { driver_id: driverId };
            return db.runQuery(sqlQuery, driverData).then(function (updatedPosition) {
                return true;
            });
        });
    });
};

var removeStoreRouteNode = function (driverId, storeId) {
    var storeIdInt = storeId.split("_")[1];
    var storeData = { store_id: storeIdInt };

    removeRouteNode(driverId, storeData).then(function (removed) {
        return true;
    });
};

var removeOrderRouteNode = function (driverId, orderId) {
    var orderIdInt = orderId.split("_")[1];
    var orderData = { order_id: orderIdInt };

    return removeRouteNode(driverId, orderData).then(function (removed) {
        return checkToEndShift(driverId).then(function (ended) {
            return true;
        });
    });
};

pub.getRoutes = function (driverId) {
    var sqlQuery = `
        SELECT routes.id AS route_id, routes.position AS position, history.id_prefix AS node_id_prefix, routes.order_id AS node_id, history.delivery_address AS node_address, "order" AS node_type,
        history.delivery_latitude AS node_latitude, history.delivery_longitude AS node_longitude
        FROM drivers_routes AS routes,
        orders_history AS history
        WHERE 
        routes.order_id = history.id
        AND routes.driver_id = ` + driverId + ` 
        
        UNION
        
        SELECT routes.id AS route_id, routes.position AS position, stores.id_prefix AS node_id_prefix, routes.store_id AS node_id, stores.address AS node_address, "store" AS node_type,
        stores.address_latitude AS node_latitude, stores.address_longitude AS node_longitude
        FROM drivers_routes AS routes,
        catalog_stores AS stores
        WHERE 
        routes.store_id = stores.id
        AND routes.driver_id = ` + driverId + `
        
        ORDER BY position`;

    return db.runQuery(sqlQuery).then(function (routes) {
        return routes;
    });
};

var setDriverOnlineFlag = function (rowId, status) {
    var data = {
        online: status
    };
    var key = {
        id: rowId
    };
    return db.updateQuery(db.dbTables.drivers_shift_history, [data, key]).then(function (updated) {
        return true;
    });
};

var endShift = function (rowId, driverId) {
    return Driver.getRoutes(driverId).then(function (routes) {
        if (routes.length == 0) {
            var sqlQuery2 = `
            UPDATE drivers_shift_history
            SET shift_end = CURRENT_TIMESTAMP
            WHERE ?`

            var key = {
                id: rowId
            };

            return db.runQuery(sqlQuery2, key).then(function (updated) {
                return updated;
            });
        }
    });
};

var checkToEndShift = function (driverId) {
    var sqlQuery = `
    SELECT * FROM drivers_shift_history WHERE shift_end = 0    
    AND online = false AND ?`

    var data = { "driver_id": driverId };
    return db.runQuery(sqlQuery, data).then(function (dbResult) {
        if (dbResult.length > 0) {
            return endShift(dbResult[0].id, driverId).then(function (ended) {
                return true;
            });
        } else {
            return true;
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
    Driver.send(driverId, json);
};

module.exports = pub;
