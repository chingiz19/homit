/**
 * @copyright Homit 2018
 */

var pub = {};
const fs = require("fs");
const path = require('path');
const redis = require('socket.io-redis');
const sharedsession = require("express-socket.io-session");
const KEY_PATH = path.normalize(process.cwd() + "/ssl/server.enc.key");
const CERTIFICATE_PATH = path.normalize(process.cwd() + "/ssl/server.crt");
const DRIVER_NAMESPACE = "/drivers";
const CM_NAMESPACE = "/chikimiki";
const STORES_NAMESPACE = "/stores";
const CSR_NAMESPACE = "/csr";
const EXTERNAL_PORT = 3000;
const INTERNAL_PORT = 6262;
const DEFAULT_EMIT = "data";
const CSR_DEFAULT_EMIT = "cm_report";
const CSR_CONNECTIVITY_EMIT = "cm_con_report";
const CM_DEFAULT_EMIT = "message";
const CM_SECRET_KEY = "hF)Zf:NR2W+gBGF]"


/* Building metadata for log */
var logMeta = {
    directory: __filename
}

/**
 * Generic parameters for connections ping interval and timeout
 */
var genericConParams = {
    pingInterval: 2000,
    pingTimeout: 10000
};


/**
 * Creating Servers:
 * 1. Secure for external connections
 * 2. Non secure for internal (localhost only) connections 
 */
var driversIOServer = require("https").createServer({
    key: fs.readFileSync(KEY_PATH),
    cert: fs.readFileSync(CERTIFICATE_PATH),
    passphrase: 'test'
});
var localCMServer = require("http").createServer();


/* Attaching Servers */
var externalIO = require("socket.io")(driversIOServer, genericConParams);
var localhostIO = require("socket.io")(localCMServer, genericConParams);


/* Attaching redis servers as adapter for socket objects */
externalIO.adapter(redis({
    host: 'localhost',
    port: 6379,
    user: process.env.REDIS_USER,
    db: db.redisTable.io_drivers
}));

localhostIO.adapter(redis({
    host: 'localhost',
    port: 6379,
    user: process.env.REDIS_USER,
    db: db.redisTable.io_cm
}));

/* Assigning namespaces */
var drivers = externalIO.of(DRIVER_NAMESPACE);
var stores = externalIO.of(STORES_NAMESPACE);
var csr = externalIO.of(CSR_NAMESPACE);
var chikimiki = localhostIO.of(CM_NAMESPACE);


/**
 * Getting session from connected sockets 
 * For now only (/stores) namespace
 * @param {*} session 
 */
pub.setSharedSessionMiddleware = function (session) {
    stores.use(sharedsession(session, {
        autoSave: true
    }));
    csr.use(sharedsession(session, {
        autoSave: true
    }));
}

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
                                Store.driverAction(driverDetails.pick_up.store_id);
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
    pub.sendToCSR({ "connected": true }, true);
    refreshCMReport();

    client.on('data', function (data) {
        CM.receiver(JSON.parse(data));
    });

    client.on('disconnect', function () {
        Logger.log.warn("Connection to CM has been lost", logMeta);
        SMS.alertDirectors("\u26A0 CM is down \u26A0");
        pub.sendToCSR({ "connected": false }, true);
    });

    /* CM error listener that will be logged here as well */
    client.on('error', function (data) {
        Logger.log.error("CM connection is experiencing issues", logMeta);
    })

    client.on('error', function (data) {
        Logger.log.error("CM connection is experiencing issues", logMeta);
    })
});

/**
 * Connection handler for CM
 */
stores.on('connection', function (client) {
    if (Auth.validateStoreWebSocket(client)) {
        //Welcome, join room with your ID
        let stringStoreID = "s_" + client.handshake.session.store_id;

        Logger.log.debug("Connection to Store app with ID:" + stringStoreID + " established", logMeta);
        console.log("Store with ID: " + stringStoreID + " Auth and Connected!");

        client.join(stringStoreID, async () => {
            Logger.log.verbose("Store has been joined to room");
        });

        //we don't expect data from Stores app yet
        client.on('data', function (data) { });

        //Store app remote logger is going to fire 'app_error' events
        client.on('app_error', function (data) {
            Logger.storeLog.error(data);
        });

        client.on('disconnect', function () {
            Logger.log.warn("Connection to store app has been lost", logMeta);
            console.log("Connection lost")
        });

        client.on('error', function (data) {
            Logger.log.error("Store app connection is experiencing issues", logMeta);
        })
    } else {
        client.disconnect();
    }
});

/**
 * Connection handler for CSR
 */
csr.on('connection', function (client) {
    if(Auth.validateCSRWebSocket(client)){
        refreshCMReport();
    
        client.on('disconnect', function () {
            console.log("csr disconnected!");
        });
    
        client.on('error', function (data) {
            console.log("CM connection is experiencing issues");
        })
    
        client.on('error', function (data) {
            console.log("CM connection is experiencing issues");
        })
    } else {
        client.disconnect();
    }
});

/**
 * Sends data to stores 
 * @param {*} id store id
 * @param {*} json data to be sent
 */
pub.sendToStores = async function (id, json) {
    stores.to(id).emit(DEFAULT_EMIT, JSON.stringify(json) + "\n");
}

/**
 * Sends data to CM
 * @param {*} json data to be sent
 * @param {*} isOrder if it is order or not
 */
pub.sendToCM = async function (json, isOrder) {
    if (isOrder) {
        Logger.log.debug('Sending order to CM \n Store type: ' + json.details.order.store_type, logMeta);
    }
    chikimiki.emit(CM_DEFAULT_EMIT, json);
}

/**
 * Prepares order with given data and sends it to CM using function above
 * @param {*} customerId customer id
 * @param {*} customerAddress adress
 * @param {*} orderId order id
 * @param {*} storeType store type 
 */
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

/**
 * 
 * @param {*} orderId order id 
 * @param {*} driverId driver id
 */
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
 * Sends data to driver
 * 
 * @param {*} id driver id 
 * @param {*} json data to be sent
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
        if (process.env.n_mode == "production") {
            SMS.notifyDriver("Your app is disconnected and you have been dispatched for an order " +
                json.details.customer.order.id,
                driverInfo.first_name, driverInfo.phone_number, function response() { });
        }
    }
}

pub.sendToCSR = function (data, connectivity) {
    if (!connectivity) {
        csr.emit(CSR_DEFAULT_EMIT, JSON.stringify(data));
    } else {
        csr.emit(CSR_CONNECTIVITY_EMIT, JSON.stringify(data));
    }
}

function refreshCMReport() {
    let json = {
        "action": "refresh_report"
    };
    pub.sendToCM(json);
}

/* Start listening to internal and external ports */
try {
    driversIOServer.listen(EXTERNAL_PORT);
    localCMServer.listen(INTERNAL_PORT);
} catch (err) {
    Logger.log.error("Can't listen to ports. Please close other apps that might be using the same port", logMeta);
}

module.exports = pub;
