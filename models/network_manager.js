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
var driverConnector = require("net");
const SOCKET_PORT = 3000;
const DEFAULT_EMIT = "data";

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

/* Attaching redis server as adapter */
io.adapter(redis({
    host: 'localhost',
    port: 6379,
    user: process.env.REDIS_USER
}));


/* Building drivers namespace */
var drivers = io.of(DRIVER_NAMESPACE);

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
                            CM.send(receivedJson);
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
} catch (err) {
    Logger.log.error("Can't listen to port " + SOCKET_PORT + "Please close other apps that might be using the same port", logMeta);
}

module.exports = pub;
