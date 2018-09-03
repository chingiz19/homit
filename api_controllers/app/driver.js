/**
 * @copyright Homit 2018
 */

let router = require("express").Router();

const driverStatus = {
    ONLINE: "online",
    OFFLINE: "offline",
    ARRIVED_STORE: "arrived_store",
    PICK_UP: "pick_up",
    DROP_OFF: "drop_off",
    LOCATION_UPDATE: "location_update",
    REMOVE_ORDER: "remove_order",

    CM_OBJECT: {
        "action": "driver_status",
        "details": {}
    },

    online: async function (driverId, latitude, longitude) {
        let localObject = Object.assign(this.CM_OBJECT);
        localObject.details.driver_id = driverId;
        localObject.details.status = this.ONLINE;
        localObject.details.location = {
            "latitude": latitude,
            "longitude": longitude
        };
        return await NM.sendToCM(localObject, false);
    },

    offline: async function (driverId, latitude, longitude) {
        let localObject = Object.assign(this.CM_OBJECT);
        localObject.details.driver_id = driverId;
        localObject.details.status = this.OFFLINE;
        localObject.details.location = {
            "latitude": latitude,
            "longitude": longitude
        };
        return await NM.sendToCM(localObject, false);
    },

    arrivedStore: async function (driverId, storeId) {
        let localObject = Object.assign(this.CM_OBJECT);
        localObject.details.driver_id = driverId;
        localObject.details.status = this.ARRIVED_STORE;
        localObject.details.arrived_store = {
            "store_id": storeId
        };
        return await NM.sendToCM(localObject, false);
    },

    pickUp: async function (driverId, storeId) {
        let localObject = Object.assign(this.CM_OBJECT);
        localObject.details.driver_id = driverId;
        localObject.details.status = this.PICK_UP;
        localObject.details.pick_up = {
            "store_id": storeId
        };
        return await NM.sendToCM(localObject, false);
    },

    dropOff: async function (driverId, orderId) {
        let localObject = Object.assign(this.CM_OBJECT);
        localObject.details.driver_id = driverId;
        localObject.details.status = this.DROP_OFF;
        localObject.details.drop_off = {
            "order_id": orderId
        };
        return await NM.sendToCM(localObject, false);
    },

    locationUpdate: async function (driverId, latitude, longitude) {
        let localObject = Object.assign(this.CM_OBJECT);
        localObject.details.driver_id = driverId;
        localObject.details.status = this.LOCATION_UPDATE;
        localObject.details.location = {
            "latitude": latitude,
            "longitude": longitude
        };
        return await NM.sendToCM(localObject, false);
    }
}

/**
 * Signs user session and sends driver object (including online status) back to app
 */
router.post('/signin', function (req, res) {
    let username = req.body.username;
    let password = req.body.password;

    if (!(username && password)) {
        ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
    } else {
        Driver.authenticateDriver(username, password).then(async function (driver) {
            if (driver != false) {
                let driverStatus = await Driver.getDriverStatus(driver.id);
                let finalDriver = Object.assign(driver, driverStatus);
                let result = await Driver.insertDriverStatusTable(driver.id);
                if (result && finalDriver && driverStatus) {
                    Auth.signSession(req, finalDriver, Auth.RolesJar.DRIVER);
                    res.send({
                        success: true,
                        driver: finalDriver
                    });
                } else {
                    ErrorMessages.sendErrorResponse(res);
                }
            } else {
                ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.INVALID_CREDENTIALS);
            }
        });
    }
});

/**
 * Retrieves user's route nodes from driver_routes table and sends back to app in ordered array 
 * Requires driver ID
 */
router.post('/getorders', Auth.validateDriver(), async function (req, res) {
    let driverId = req.body.driver_id;
    let routes = await Driver.getDriversRoutes(driverId);

    if (routes) {
        res.send({
            success: true,
            details: routes
        });
    } else {
        ErrorMessages.sendErrorResponse(res);
    }
});

/**
 * Updates arrived store column with current time stamp  
 * Requires driver ID, store ID and array of order IDs related to this store
 */
router.post('/arrivedstore', Auth.validateDriver(), async function (req, res) {
    let orderIds = JSON.parse(req.body.order_ids);
    let storeId = req.body.id;
    let driverId = req.body.driver_id;
    let split = splitOrders(orderIds);

    if (storeId && orderIds) {
        let result1 = false;
        let result2 = false;

        if (split.api_orders.length > 0) {
            result1 = await Driver.saveArrivedStore(split.api_orders, true);
        }

        if (split.regular_orders.length > 0) {
            result2 = await Driver.saveArrivedStore(split.regular_orders, false);
        }

        if (result1 || result2) {
            res.send({ success: await driverStatus.arrivedStore(driverId, storeId) });
        } else {
            ErrorMessages.sendErrorResponse(res);
        }
    } else {
        ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
    }
});

/**
 * Removes store that is on user's route list and updates DB time for store pick up
 * Requires driver ID, store ID and array of order IDs related to this store
 */
router.post('/pickup', Auth.validateDriver(), async function (req, res) {
    let orderIds = JSON.parse(req.body.order_ids);
    let storeId = req.body.store_id;
    let driverId = req.body.driver_id;
    let isApiOrder = checkIFApiOrders(orderIds);
    let split = splitOrders(orderIds);

    if (storeId && orderIds) {
        let removedNode1 = await Driver.removeStoreRouteNode(driverId, storeId.split('_')[1], isApiOrder);
        let removedNode2 = false;
        let savedPickUp1 = false;
        let savedPickUp2 = false;

        if (!removedNode1 && split.have_both_types) {
            removedNode2 = await Driver.removeStoreRouteNode(driverId, storeId.split('_')[1], !isApiOrder);
        }

        if (split.api_orders.length > 0) {
            savedPickUp1 = await Driver.savePickUp(split.api_orders, true);
        }

        if (split.regular_orders.length > 0) {
            savedPickUp2 = await Driver.savePickUp(split.regular_orders, false);
        }

        if ((savedPickUp1 || savedPickUp2) && (removedNode1 || removedNode2)) {
            Store.driverAction(storeId);
            res.send({ success: await driverStatus.pickUp(driverId, storeId) });
        } else {
            ErrorMessages.sendErrorResponse(res);
        }
    } else {
        ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
    }
});

/**
 * Updates arrived customer column for each order related to given customer ID with current time stamp  
 * Requires driver ID and customer ID 
 */
router.post('/arrivedcustomer', Auth.validateDriver(), async function (req, res) {
    let customerId = req.body.customer_id;
    let driverId = req.body.driver_id;
    let isApiOrder = checkIFApiOrders([customerId]);

    if (customerId) {
        let result = await Driver.saveArrivedCustomer(customerId, driverId, isApiOrder);
        if (result) {
            res.send({ success: true });
        } else {
            ErrorMessages.sendErrorResponse(res);
        }
    } else {
        ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
    }
});

/**
 * Removes order that is on user's route list 
 * Requires order ID,  driver ID
 */
router.post('/dropoff', Auth.validateDriver(), async function (req, res) {
    let orderId = req.body.order_id;
    let driverId = req.body.driver_id;
    let details = req.body;
    let isApiOrder = checkIFApiOrders([orderId]);

    if (details && orderId) {
        let removedNode = await Driver.removeOrderRouteNode(driverId, orderId.split('_')[1], isApiOrder);
        let savedDropOff = await Driver.saveDropOff(details, isApiOrder);

        if (removedNode && savedDropOff) {
            res.send({ success: await driverStatus.dropOff(driverId, orderId) });
        } else {
            ErrorMessages.sendErrorResponse(res);
        }
    } else {
        ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
    }
});

/**
 * Updates latitude and longitude columns in drivers_status table  
 * Requires driver ID, latitude and longitude
 */
router.post('/locationupdate', Auth.validateDriver(), async function (req, res) {
    let latitude = req.body.latitude;
    let longitude = req.body.longitude;
    let driverId = req.body.driver_id;

    if (longitude && latitude) {
        let result = await Driver.updateLocation(driverId, latitude, longitude);
        if (result) {
            res.send({ success: await driverStatus.locationUpdate(driverId, latitude, longitude) });
        } else {
            ErrorMessages.sendErrorResponse(res);
        }
    } else {
        ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
    }
});

/**
 * Updates online/offline status in drivers_status table  
 * Requires driver ID, status boolean, latitude and longitude
 */
router.post('/statusupdate', Auth.validateDriver(), async function (req, res) {
    let status = req.body.online;
    let latitude = req.body.latitude;
    let longitude = req.body.longitude;
    let driverId = req.body.driver_id;

    if (latitude && longitude) {
        if (status) {
            let savedOnline = await Driver.saveOnline(driverId);
            let updatedLocation = await Driver.updateLocation(driverId, latitude, longitude);

            if (savedOnline && updatedLocation) {
                res.send({ success: await driverStatus.online(driverId, latitude, longitude) });
            } else {
                ErrorMessages.sendErrorResponse(res);
            }
        } else {
            let savedOffline = await Driver.saveOffline(driverId);

            if (savedOffline) {
                res.send({ success: await driverStatus.offline(driverId, latitude, longitude) });
            } else {
                ErrorMessages.sendErrorResponse(res);
            }
        }
    } else {
        ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
    }
});

/**
 * Saves Firebase token to DB   
 * Requires driver ID, token 
 */
router.post('/registerToken', Auth.validateDriver(), async function (req, res) {
    let driverId = req.body.driver_id;
    if (req.body.firebase_token) {
        let result = await Driver.saveFirebaseTokenById(driverId, req.body.firebase_token);
        if (result) {
            res.send({ success: true });
        } else {
            ErrorMessages.sendErrorResponse(res);
        }
    } else {
        ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
    }
});

/**
 * Checks authentication on exsisting user session 
 * if true returns same driver object as in /signin 
 * Requires driver ID, latitude and longitude
 */
router.post('/authenticate', Auth.validateDriver(), async function (req, res) {
    let driverId = req.body.driver_id;

    if (driverId) {
        let result = await Driver.getDriverObject(driverId);
        if (result) {
            res.send({
                success: true,
                driver: result
            });
        } else {
            ErrorMessages.sendErrorResponse(res);
        }
    } else {
        ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
    }
});

/**
 * Destroys user's session and deletes entire row in drivers_status table   
 * Requires driver ID 
 */
router.post('/logout', Auth.validateDriver(), async function (req, res) {
    let result = await Auth.invalidate(req);
    if (result) {
        res.send({ success: true });
    } else {
        ErrorMessages.sendErrorResponse(res);
    }
});

router.use('/photo', Auth.driverPhotoAuth(), express.static('./non_public_photos/drivers'));

function checkIFApiOrders(raw) {
    for (let i in raw) {
        if (raw[i].split('_')[0] == 'a') { return true; }
    }
    return false;
}

function splitOrders(raw) {
    let apiOrders = [];
    let regularOrders = [];
    let haveRegular = false;
    let haveApi = false;

    for (let i in raw) {
        if (raw[i].split('_')[0] == 'a') {
            apiOrders.push(raw[i]);
            haveApi = true;
        } else {
            regularOrders.push(raw[i]);
            haveRegular = true;
        }
    }

    return {
        api_orders: apiOrders,
        regular_orders: regularOrders,
        have_both_types: (haveApi && haveRegular)
    };
}

module.exports = router;
