/**
 * @copyright Homit 2018
 */

var pub = {};
var fs = require("fs");
const path = require('path');
const redis = require('socket.io-redis');
const KEY_PATH = path.normalize(process.cwd() + "/ssl/server.enc.key");
const CERTIFICATE_PATH = path.normalize(process.cwd() + "/ssl/server.crt");
const DRIVER_NAMESPACE = "/drivers";
const CM_NAMESPACE = "/chikimiki";
const SOCKET_PORT = 3000;
const CM_SOCKET_PORT = 6262;
const DEFAULT_EMIT = "data";
const CM_DEFAULT_EMIT = "message";
const CM_SECRET_KEY = "hF)Zf:NR2W+gBGF]"

/* Building metadata for log */
var logMeta = {
    directory: __filename
}

/* Building Server for socket io */
var sockIOServer = require("https").createServer({
    key: fs.readFileSync(KEY_PATH),
    cert: fs.readFileSync(CERTIFICATE_PATH),
    passphrase: 'test'
});

/* Attaching socket io server */
var io = require("socket.io")(sockIOServer, {
    pingInterval: 2000,
    pingTimeout: 10000
});

/* Attaching redis server as adapter to local server for CM */
io.adapter(redis({
    host: 'localhost',
    port: 6379,
    user: process.env.REDIS_USER
}));


/**
 * Separate local server for CM connections
 */

/* Creating local server for CM */
var localServer = require("http").createServer();

/* Attaching Redis to local server to socketio */
var chikimikiIO = require("socket.io")(localServer, {
    pingInterval: 2000,
    pingTimeout: 10000
});

/* Attaching redis server as adapter to local server for CM */
chikimikiIO.adapter(redis({
    host: 'localhost',
    port: 6379,
    user: process.env.REDIS_USER
}));


/* Building drivers namespace */
var drivers = io.of(DRIVER_NAMESPACE);
var chikimiki = chikimikiIO.of(CM_NAMESPACE);

/**
 * Connection handler for Drivers
 */
drivers.on("connection", function (socket) {
    socket.isVerified = false;

    setTimeout(function () {
        if (!socket.isVerified) {
            socket.disconnect();
        }
    }, 5000);

    socket.on("verify", async function (data) {
        var receivedJson = JSON.parse(data);
        var tokenData = JWTToken.validateToken(receivedJson.token);
        if (!tokenData || tokenData.driver_id != receivedJson.driver_id) {
            socket.disconnect();
        } else {
            var driverId = tokenData.driver_id.split("_")[1];
            socket.isVerified = true;
            socket.join(tokenData.driver_id, async () => {
                Logger.log.verbose("Driver with id: " + tokenData.driver_id + " has been connected!");
                await Driver.updateDriverStatusConnected(driverId, socket.id);
                var requests = await Driver.getDriversRequest(driverId);
                for (var i = 0; i < requests.length; i++) {
                    pub.sendToDriver("d_" + requests[i].driver_id, JSON.parse(requests[i].order_info));
                }
            });
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
            drivers.adapter.clientRooms(socket.id, (err, rooms) => {
                if (err) {
                    Logger.log.error("Error while getting driver id from room.", logMeta);
                } else {
                    if (rooms.length != 0 && rooms[1] === driverIdString) {
                        var driverIdInt = driverIdString.split("_")[1];
                        var sendToCm = true;
                        switch (driverDetails.status) {
                            case "online":
                                Driver.saveOnline(driverIdInt);
                                Driver.updateLocation(driverIdInt, driverDetails.location);
                                break;
                            case "offline":
                                Driver.saveOffline(driverIdInt);
                                break;
                            case "arrived_store":
                                Logger.log.verbose("Data received from driver: arrived_store");
                                Logger.log.verbose("store_id: " + driverDetails.arrived_store.store_id);
                                Logger.log.verbose("order_ids: " + driverDetails.arrived_store.order_ids + "\n");
                                Driver.saveArrivedStore(driverIdInt, driverDetails.arrived_store.order_ids);
                                Driver.removeStoreRouteNode(driverIdInt, driverDetails.arrived_store.store_id);
                                break;
                            case "pick_up":
                                Logger.log.verbose("Data received from driver: pick_up");
                                Logger.log.verbose("store_id: " + driverDetails.pick_up.store_id);
                                Logger.log.verbose("order_ids: " + driverDetails.pick_up.order_ids + "\n");
                                Driver.savePickUp(driverIdInt, driverDetails.pick_up.order_ids);
                                break;
                            case "drop_off":
                                Logger.log.verbose("Data received from driver: drop_off");
                                Logger.log.verbose("order_id: " + driverDetails.drop_off.order_id);
                                Logger.log.verbose("refused: " + driverDetails.drop_off.refused);
                                Logger.log.verbose("same_receiver: " + driverDetails.drop_off.same_receiver);
                                Logger.log.verbose("receiver_name: " + driverDetails.drop_off.receiver_name);
                                Logger.log.verbose("receiver_age: " + driverDetails.drop_off.receiver_age + "\n");
                                Driver.removeOrderRouteNode(driverIdInt, driverDetails.drop_off.order_id);
                                Driver.saveDropOff(driverIdInt, driverDetails.drop_off);
                                break;
                            case "location_update":
                                Driver.updateLocation(driverIdInt, driverDetails.location);
                                break;
                            case "arrived_customer":
                                Logger.log.verbose("Data received from driver: arrived_customer");
                                Logger.log.verbose("customer_id: " + driverDetails.arrived_customer.customer_id);
                                Logger.log.verbose("order_ids: " + driverDetails.arrived_customer.order_ids + "\n");
                                Driver.saveArrivedCustomer(driverIdInt, driverDetails.arrived_customer.order_ids);
                                sendToCm = false;
                                break;
                            default:
                                Logger.log.error("Wrong 'status' received from driver app. Received data: " + receivedJson.stringify(), logMeta);
                        }
                        if (sendToCm) {
                            pub.sendToCM(receivedJson);
                        }
                    } else {
                        // Driver.update disconnect
                        Driver.updateDriverStatusDisconnected(socket.id)
                        socket.disconnect();
                    }
                }
            });
        } else {
            Logger.log.error("Wrong 'action' received from driver app. Received data: " + receivedJson.stringify(), logMeta);
        }
    });

    socket.on("disconnect", function () {
        Driver.updateDriverStatusDisconnected(socket.id);
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

/**
 * Connection handler for CM
 */
chikimiki.on('connection', function (client) {
    var verification = {
        "action": "verify_server",
        "key": CM_SECRET_KEY
    }
    pub.sendToCM(verification);
    Logger.log.debug("Connection to CM established", logMeta);

    client.on('data', function (data) {
        CM.receiver(JSON.parse(data));
    });

    client.on('disconnect', function () {
        Logger.log.warn("Connection to CM has been lost", logMeta);
        SMS.alertDirectors("\u26A0 CM is down \u26A0");
    });

    /* CM error listener that will be logged here as well */
    client.on('error', function (data) {
        Logger.log.error("CM connection is experiencing issues", logMeta);
    })

    client.on('error', function (data) {
        Logger.log.error("CM connection is experiencing issues", logMeta);
    })
});


pub.sendToCM = async function (json, isOrder) { 
    if (isOrder) {
        Logger.log.debug('Sending order to CM \n Store type: ' + json.details.order.store_type, logMeta);
    }
    chikimiki.emit(CM_DEFAULT_EMIT, json);
}


pub.sendOrderToCM = function (customerId, customerAddress, orderId, storeType) {
    var newOrder = {
        "action": "neworder",
        "details": {
            "customer": {
                "id": customerId,
                "address": customerAddress
            },
            "order": {
                "id": orderId,
                "store_type": storeType
            }
        }
    };
    pub.sendToCM(newOrder, true);
}


pub.cancelCMOrder = function (orderId, driverId) {
    var driverIdString = "d_" + driverId;
    var orderIdString = "o_" + orderId;

    var json = {
        "action": "driver_status",
        "details": {
            "driver_id": driverIdString,
            "status": "remove_order",
            "remove_order": {
                "order_id": orderIdString
            }
        }
    };
    pub.sendToCM(json);
};


/**
 * Send data to driver
 * 
 * @param {*} id 
 * @param {*} json 
 */
pub.sendToDriver = async function (id, json) {
    var driverId = id.split("_")[1];
    var driverConnected = await Driver.isConnected(driverId);

    if (driverConnected) {
        drivers.to(id).emit(DEFAULT_EMIT, JSON.stringify(json) + "\n");
        Logger.log.verbose("Sending order to driver with id: " + id + " ", logMeta);
    } else {
        await Driver.addToDriversRequest(driverId, json);
        var driverInfo = await Driver.findDriverById(driverId);
        SMS.notifyDriver("Your app is disconnected and you have been dispatched for an order " +
            json.details.customer.order.id,
            driverInfo.first_name, driverInfo.phone_number, function response() { });
    }
}

try {
    sockIOServer.listen(SOCKET_PORT);
    localServer.listen(CM_SOCKET_PORT);
} catch (err) {
    Logger.log.error("Can't listen to port " + SOCKET_PORT + "Please close other apps that might be using the same port", logMeta);
}

module.exports = pub;
