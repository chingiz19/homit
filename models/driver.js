/**
 * @copyright Homit 2017
 */
var driverConnector = require("net");

var pub = {};
var driverConnections = {};

/**
 * Authenticate driver
 */
pub.authenticateDriver = function (email, password) {
    var sqlQuery = `
    SELECT drivers.id_prefix AS id_prefix, drivers.id AS id, employees.user_email AS email, employees.first_name AS first_name, employees.last_name AS last_name, employees.password AS password
    FROM users_employees AS employees, drivers 
    WHERE drivers.employee_id = employees.id AND employees.role_id=3 AND ?`;

    var data = {
        "employees.user_email": email
    };
    return db.runQuery(sqlQuery, data).then(function (user) {
        if (user.length > 0) {
            return Auth.comparePassword(password, user[0].password).then(function (match) {
                if (match) {
                    return User.sanitizeUserObject(user[0]);
                } else {
                    return false;
                }
            });
        }
        return false;
    });
};

/**
 * Get connection info for driver
 */
pub.getConnectionPort = function (receivedDriverId) {
    var portId;
    var driverId;
    var portInitiator = driverConnector.createServer(function (connection) {
        connection.writable = true;

        if (driverConnections[driverId]) {
            Logger.log(driverId + " has reconnected back");
            driverConnections[driverId].connection = connection;
            driverConnections[driverId].online = true;

            for (var i = 0; i < driverConnections[driverId].temp_storage.length; i++) {
                Driver.send(driverId, driverConnections[driverId].temp_storage[i]);
            }

        } else {
            Logger.log(driverId + " has been connected");
            var conInfo = {
                online: true,
                port: portId,
                connection: connection,
                temp_storage: []
            };
            driverConnections[driverId] = conInfo;
        }

        connection.on("data", function (receivedData) {
            var receivedJson = JSON.parse(receivedData);
            Logger.log(receivedJson);
            if (receivedJson.action == "driver_status") {
                var driverDetails = receivedJson.details;
                var driverIdString = driverDetails.driver_id;
                var driverIdInt = driverIdString.split("_")[1];
                var sendToCm = true;
                switch (driverDetails.status) {
                    case "online":
                        saveOnline(driverIdInt);
                        break;
                    case "offline":
                        saveOffline(driverIdInt);
                        break;
                    case "arrived_store":
                        saveArrivedStore(driverIdInt, driverDetails.arrived_store.order_ids);
                        removeStoreRouteNode(driverIdInt, driverDetails.arrived_store.store_id);
                        break;
                    case "pick_up":
                        savePickUp(driverIdInt, driverDetails.pick_up.order_ids);
                        break;
                    case "drop_off":
                        removeOrderRouteNode(driverIdInt, driverDetails.arrived_store.order_id);
                        saveDropOff(driverIdInt, driverDetails.drop_off);
                        break;
                    case "location_update":
                        saveLocation(driverIdInt, driverDetails.location);
                        break;
                    case "arrived_customer":
                        saveArrivedCustomer(driverIdInt, driverDetails.arrived_customer.order_ids);
                        // send text message
                        sendToCm = false;
                        break;
                    default:
                        // Logger.log("Error has been occurred ");
                        Logger.log("Wrong driver status");
                }
                if (sendToCm) {
                    CM.send(receivedJson);
                }
            } else {
                Logger.log("Error has been occurred ");
            }
        });

        connection.on("close", function (data) {
            driverConnections[driverId].online = false;
            Logger.log(driverId + " app has been disconnected from server");
        });

        connection.on("error", function (data) {
            Logger.log("Error has been occurred " + data);
        })
    });

    return new Promise(function (resolve, reject) {
        portInitiator.listen(0, "0.0.0.0", function () {
            Logger.log("Waiting for " + receivedDriverId + " at port " + portInitiator.address().port);
            portId = portInitiator.address().port;
            driverId = receivedDriverId;
            if (portId != 0) {
                resolve(portId);
            } else {
                reject(0);
            }
        });
    });
};

pub.send = function (driverId, json) {
    if (driverConnections[driverId]) {
        if (driverConnections[driverId].online) {
            driverConnections[driverId].connection.write(" " + JSON.stringify(json) + "\n");
        } else {
            driverConnections[driverId].temp_storage.push(json);
        }
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
                return updated;
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

var saveArrivedCustomer = function (driverId, orderIds) {
    updateOrdersHistory("date_arrived_customer", orderIds);
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
    var updateData = {
        longitude: location.longitude,
        latitude: location.latitude
    };
    var key = {
        id: driverId
    };

    return db.updateQuery(db.dbTables.drivers_location, [updateData, key]).then(function (updated) {
        return updated;
    });
};

pub.getOnlineDrivers = function () {
    var sqlQuery = `
    SELECT drivers.id AS driver_id, drivers.id_prefix AS driver_id_prefix,
    employee.user_email AS email, employee.first_name AS first_name,
    employee.last_name AS last_name, employee.phone_number AS phone_number,
    location.latitude AS latitude, location.longitude AS longitude,
    shift.shift_start AS shift_start, shift.online AS is_online
    FROM 
    drivers_shift_history AS shift,
    drivers,
    users_employees AS employee,
    drivers_location AS location
    WHERE
    shift.shift_end = 0
    AND drivers.id = shift.driver_id
    AND employee.id = drivers.employee_id,
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
    var storeData = { store_id: storeId };

    removeRouteNode(driverId, storeData).then(function (removed) {
        return true;
    });
};

var removeOrderRouteNode = function (driverId, orderId) {
    var orderData = { order_id: orderId };

    removeRouteNode(driverId, orderData).then(function (removed) {
        return checkToEndShift(driverId).then(function (ended) {
            return true;
        });
    });
};

pub.getRoutes = function (driverId) {
    var sqlQuery = `
        SELECT routes.id AS route_id, routes.position AS position, history.id_prefix AS node_id_prefix, routes.order_id AS node_id, history.delivery_address AS node_address, "order" AS node_type
        FROM drivers_routes AS routes,
        orders_history AS history
        WHERE 
        routes.order_id = history.id
        AND routes.driver_id = ` + driverId + ` 
        
        UNION
        
        SELECT routes.id AS route_id, routes.position AS position, stores.id_prefix AS node_id_prefix, routes.store_id AS node_id, stores.address AS node_address, "store" AS node_type
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
    db.updateQuery(db.dbTables.drivers_shift_history, [data, key]).then(function (updated) {
        return updated.id;
    });
};

var endShift = function (rowId, driverId) {
    return getRoutes(driverId).then(function (routes) {
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
        return endShift(dbResult[0].id, driverId).then(function (ended) {
            return true;
        });
    });
};

module.exports = pub;
