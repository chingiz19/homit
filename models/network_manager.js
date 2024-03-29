/**
 * @copyright Homit 2018
 */

let pub = {};
let externalIOServer = {};
let ackStore = new Map();
const fs = require("fs");
const path = require('path');
const redis = require('socket.io-redis');
const sharedsession = require("express-socket.io-session");
const firebaseAdmin = require("firebase-admin");
const KEY_PATH = path.normalize(process.cwd() + "/ssl/server.enc.key");
const CERTIFICATE_PATH = path.normalize(process.cwd() + "/ssl/server.crt");
const CM_NAMESPACE = "/chikimiki";
const STORES_NAMESPACE = "/stores";
const CSR_NAMESPACE = "/csr";
const EXTERNAL_PORT = 3000;
const INTERNAL_PORT = 6262;
const CM_RESPONSE_TIMEOUT = 2000;
const DEFAULT_EMIT = "data";
const CSR_DEFAULT_EMIT = "cm_report";
const CSR_CONNECTIVITY_EMIT = "cm_con_report";
const CM_DEFAULT_EMIT = "message";
const CM_SECRET_KEY = "hF)Zf:NR2W+gBGF]"
const serviceAccount = require("../homit-drivers-firebase-adminsdk.json");


/* Building metadata for log */
let logMeta = {
    directory: __filename
}

/**
 * Generic parameters for connections ping interval and timeout
 */
let genericConParams = {
    pingInterval: 2000,
    pingTimeout: 10000
};

/**
 * Initialize admin SDK for Firebase Cloud Messaging
 */
firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    databaseURL: "https://homit-drivers-ec26a.firebaseio.com"
});

/**
 * Creating Servers:
 * 1. Secure for external connections
 * 2. Non secure for internal (localhost only) connections 
 */
if (process.env.n_mode == "production") {
    externalIOServer = require("https").createServer({
        key: fs.readFileSync(KEY_PATH),
        cert: fs.readFileSync(CERTIFICATE_PATH),
        passphrase: 'test'
    });
} else {
    externalIOServer = require("http").createServer();
}

let localCMServer = require("http").createServer();


/* Attaching Servers */
let externalIO = require("socket.io")(externalIOServer, genericConParams);
let localhostIO = require("socket.io")(localCMServer, genericConParams);


/* Attaching redis servers as adapter for socket objects */
externalIO.adapter(redis({
    host: 'localhost',
    port: 6379,
    user: process.env.REDIS_USER,
    db: db.redisTable.io_external
}));

localhostIO.adapter(redis({
    host: 'localhost',
    port: 6379,
    user: process.env.REDIS_USER,
    db: db.redisTable.io_internal
}));

/* Assigning namespaces */
let stores = externalIO.of(STORES_NAMESPACE);
let csr = externalIO.of(CSR_NAMESPACE);
let chikimiki = localhostIO.of(CM_NAMESPACE);


/**
 * Getting session from connected sockets 
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
 * Connection handler for CM
 */
chikimiki.on('connection', async function (client) {
    client.on('data', function (data) {
        CM.receiver(JSON.parse(data));
    });

    client.on('resolve', function (data) {
        let jsonData = JSON.parse(data);
        let cb = ackStore.get(jsonData.ack_id);
        cb(jsonData);
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

    let verification = {
        "action": "verify_server",
        "key": CM_SECRET_KEY
    }

    let result = await pub.sendToCM(verification);
    if (result && process.env.n_mode == "production") {
        Logger.log.debug("Connection to CM established", logMeta);
    } else if (result) {
        console.log("Connection to CM established");
    }
    pub.sendToCSR({ "connected": true }, true);
    refreshCMReport();
});

/**
 * Connection handler for CM
 */
stores.on('connection', function (client) {
    if (Auth.validateWebSocket(client, Auth.RolesJar.STORE)) {
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
            console.log("Store lost connection")
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
    if (Auth.validateWebSocket(client, Auth.RolesJar.CSR)) {
        refreshCMReport();
        client.on('disconnect', function () {
            Logger.log.warn("csr disconnected!");
        });

        client.on('error', function (data) {
            Logger.log.warn("csr connection is experiencing issues");
        })

        client.on('error', function (data) {
            Logger.log.warn("csr connection is experiencing issues");
        })
    } else {
        client.disconnect();
    }
});

/**
 * Prepares order with given data and sends it to CM using function above
 * @param {*} customerId customer id
 * @param {*} customerAddress adress
 * @param {*} orderId order id
 * @param {*} storeType store type 
 * @param {boolean} isApiOrder 
 * @param {*} customPickupAddress 
 * @param {*} pickUpId 
 */
pub.sendOrderToCM = async function (customerId, customerAddress, orderId, storeType, isApiOrder, customPickupAddress, pickUpId) {
    let newOrder = {
        "action": "neworder",
        "api_order": isApiOrder,
        "pick_up": {
            "custom": (customPickupAddress != undefined),
            "store_type": storeType,
            "custom_pickup_id": pickUpId,
            "address": customPickupAddress
        },
        "details": {
            "customer": {
                "id": customerId,
                "address": customerAddress
            },
            "order": {
                "id": orderId
            }
        }
    };

    return await pub.sendToCM(newOrder, true);
}

/**
 * 
 * @param {*} orderId order id 
 * @param {*} driverId driver id
 */
pub.cancelCMOrder = function (orderId, driverId) {
    let driverIdString = "d_" + driverId;
    let orderIdString = "o_" + orderId;

    let json = {
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
 */
pub.notifyDriver = async function (id) {
    let token = await Driver.findFirebaseTokenById(id);

    if (token) {
        let message = {
            "token": token,
            "android": {
                "priority": "HIGH",
                "data": {
                    "title": 'Message from Dispatch',
                    "body": 'New Order'
                }
            }
        }

        // Send a message to the device corresponding to the provided registration token.
        firebaseAdmin.messaging().send(message)
            .then((response) => {
                console.log('Successfully sent message:', response);
            })
            .catch((error) => {
                console.log('Error sending message:', error);
            });
    } else {
        //TODO error logger
        console.log("Token is not present | firebase");
    }
}

pub.sendToCSR = function (data, connectivity) {
    if (!connectivity) {
        csr.emit(CSR_DEFAULT_EMIT, JSON.stringify(data));
    } else {
        csr.emit(CSR_CONNECTIVITY_EMIT, JSON.stringify(data));
    }
}

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
    return new Promise((resolve, reject) => {
        if (isOrder) {
            Logger.log.debug('Sending order to CM \n Store type: ' + json.pick_up.store_type, logMeta);
        }
        let ackId = HelperUtils.generateAckId(Array.from(ackStore.keys()));
        json.ack_id = ackId;
        ackStore.set(ackId, function (response) {
            if (response.success) {
                resolve(true);
            } else {
                resolve(false);
            }
            ackStore.delete(response.ack_id)
        });

        setTimeout(function () {
            if (ackStore.has(ackId)) {
                resolve(false);
            }
        }, CM_RESPONSE_TIMEOUT);

        chikimiki.emit(CM_DEFAULT_EMIT, json);
    });
}

async function refreshCMReport() {
    let result = await pub.sendToCM({ "action": "refresh_report" });
    if (!result) {
        if (process.env.n_mode != "production") {
            console.log("Could not obtain CM report for connected CSR");
        }
    }
}

/* Start listening to internal and external ports */
try {
    externalIOServer.listen(EXTERNAL_PORT);
    localCMServer.listen(INTERNAL_PORT);
} catch (err) {
    Logger.log.error("Can't listen to ports. Please close other apps that might be using the same port", logMeta);
}

module.exports = pub;
