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
            console.log(driverId + " has reconnected back");
            driverConnections[driverId].connection = connection;
            driverConnections[driverId].online = true;

            for (var i = 0; i < driverConnections[driverId].temp_storage.length; i++) {
                Driver.send(driverId, driverConnections[driverId].temp_storage[i]);
            }

        } else {
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
                        console.log("Data received from driver: arrived_store");
                        console.log("store_id: " + receivedJson.details.arrived_store.store_id);
                        console.log("order_ids: " + receivedJson.details.arrived_store.order_ids + "\n");
                        saveArrivedStore(driverIdInt, driverDetails.arrived_store.order_ids);
                        break;
                    case "pick_up":
                        console.log("Data received from driver: pick_up");
                        console.log("store_id: " + receivedJson.details.pick_up.store_id);
                        console.log("order_ids: " + receivedJson.details.pick_up.order_ids + "\n");
                        savePickUp(driverIdInt, driverDetails.pick_up.order_ids);
                        break;
                    case "drop_off":
                        console.log("Data received from driver: drop_off");
                        console.log("order_id: " + receivedJson.details.drop_off.order_id);
                        console.log("refused: " + receivedJson.details.drop_off.refused);
                        console.log("same_receiver: " + receivedJson.details.drop_off.same_receiver);
                        console.log("receiver_name: " + receivedJson.details.drop_off.receiver_name);
                        console.log("receiver_age: " + receivedJson.details.drop_off.receiver_age + "\n");
                        saveDropOff(driverIdInt, driverDetails.drop_off);
                        break;
                    case "location_update":
                        break;
                    case "arrived_customer":
                        console.log("Data received from driver: arrived_customer");
                        console.log("customer_id: " + receivedJson.details.arrived_customer.customer_id);
                        console.log("order_ids: " + receivedJson.details.arrived_customer.order_ids + "\n");
                        saveArrivedCustomer(driverIdInt, driverDetails.arrived_customer.order_ids);
                        // send text message
                        sendToCm = false;
                        break;
                    default:
                        console.log("Error has been occurred ");
                }
                if (sendToCm) {
                    CM.send(receivedJson);
                }
            } else {
                console.log("Error has been occurred ");
            }
        });

        connection.on("close", function (data) {
            driverConnections[driverId].online = false;
            console.log(driverId + " app has been disconnected from server");
        });

        connection.on("error", function (data) {
            console.log("Error has been occurred " + data);
        })
    });

    return new Promise(function (resolve, reject) {
        portInitiator.listen(0, "0.0.0.0", function () {
            console.log("Waiting for " + receivedDriverId + " at port " + portInitiator.address().port);
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

            var sqlQuery2 = `
            UPDATE drivers_shift_history
            SET shift_end = CURRENT_TIMESTAMP
            WHERE ?`

            var key = {
                id: dbResult[0].id
            };

            return db.runQuery(sqlQuery2, key).then(function (updated) {
                return updated;
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

module.exports = pub;
