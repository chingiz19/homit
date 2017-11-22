/**
 * @copyright Homit 2017
 */
var driverConnector = require('net');

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

        connection.on('data', function (receivedData) {
            var receivedJson = JSON.parse(receivedData);
            if (receivedJson.action == "driver_status") {
                var sendToCm = true;
                switch (receivedJson.details.status) {
                    case "online":
                        // add to db shift
                        break;
                    case "offline":
                        // add to db shift
                        break;
                    case "arrived_store":
                        // put to database
                        break;
                    case "pick_up":
                        // put to database
                        break;
                    case "drop_off":
                        // put to database                    
                        break;
                    case "location_update":
                        break;
                    case "arrived_customer":
                        // put to database                 
                        // then send text message
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

        connection.on('close', function (data) {
            driverConnections[driverId].online = false;
            console.log(driverId + " app has been disconnected from server");
        });

        connection.on('error', function (data) {
            console.log("Error has been occurred " + data);
        })
    });

    return new Promise(function (resolve, reject) {
        portInitiator.listen(0, '0.0.0.0', function () {
            console.log('Waiting for ' + receivedDriverId + ' at port ' + portInitiator.address().port);
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
            driverConnections[driverId].connection.write(JSON.stringify(json) + "\n");
        } else {
            driverConnections[driverId].temp_storage.push(json);
        }
    }
}

module.exports = pub;
