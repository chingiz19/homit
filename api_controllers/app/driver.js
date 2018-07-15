/**
 * @copyright Homit 2018
 */

let router = require("express").Router();
let path = require("path");

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

    online: function (driverId, latitude, longitude) {
        let localObject = Object.assign(this.CM_OBJECT);
        localObject.details.driver_id = driverId;
        localObject.details.status = this.ONLINE;
        localObject.details.location = {
            "latitude": latitude,
            "longitude": longitude
        };
        NM.sendToCM(localObject, false);
    },

    offline: function (driverId, latitude, longitude) {
        let localObject = Object.assign(this.CM_OBJECT);
        localObject.details.driver_id = driverId;
        localObject.details.status = this.OFFLINE;
        localObject.details.location = {
            "latitude": latitude,
            "longitude": longitude
        };
        NM.sendToCM(localObject, false);
    },

    arrivedStore: function (driverId, storeId) {
        let localObject = Object.assign(this.CM_OBJECT);
        localObject.details.driver_id = driverId;
        localObject.details.status = this.ARRIVED_STORE;
        localObject.details.arrived_store = {
            "store_id": storeId
        };
        NM.sendToCM(localObject, false);
    },

    pickUp: function (driverId, storeId) {
        let localObject = Object.assign(this.CM_OBJECT);
        localObject.details.driver_id = driverId;
        localObject.details.status = this.PICK_UP;
        localObject.details.pick_up = {
            "store_id": storeId
        };
        NM.sendToCM(localObject, false);
    },

    dropOff: function (driverId, orderId) {
        let localObject = Object.assign(this.CM_OBJECT);
        localObject.details.driver_id = driverId;
        localObject.details.status = this.DROP_OFF;
        localObject.details.drop_off = {
            "order_id": orderId
        };
        NM.sendToCM(localObject, false);
    },

    locationUpdate: function (driverId, latitude, longitude) {
        let localObject = Object.assign(this.CM_OBJECT);
        localObject.details.driver_id = driverId;
        localObject.details.status = this.LOCATION_UPDATE;
        localObject.details.location = {
            "latitude": latitude,
            "longitude": longitude
        };
        NM.sendToCM(localObject, false);
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
 * Removes order that is on user's route list 
 * Requires order ID,  driver ID
 */
router.post('/dropoff', Auth.validateDriver(), async function (req, res) {
    let orderId = req.body.order_id;
    let driverId = req.body.driver_id;
    let details = req.body;

    if (details && orderId) {
        let removedNode = await Driver.removeOrderRouteNode(driverId, orderId);
        let savedDropOff = await Driver.saveDropOff(details);

        if (removedNode && savedDropOff) {
            driverStatus.dropOff(driverId, orderId);
            res.send({ success: true });
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

    if (storeId && orderIds) {
        let savedPickUp = await Driver.savePickUp(orderIds);
        let removedNode = await Driver.removeStoreRouteNode(driverId, storeId);
        if (savedPickUp && removedNode) {
            Store.driverAction("s_" + storeId);
            driverStatus.pickUp(driverId, storeId);
            res.send({ success: true });
        } else {
            ErrorMessages.sendErrorResponse(res);
        }
    } else {
        ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
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

    if (storeId && orderIds) {
        let result = await Driver.saveArrivedStore(orderIds);
        if (result) {
            driverStatus.arrivedStore(driverId, storeId);
            res.send({ success: true });
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

    if (customerId) {
        let result = await Driver.saveArrivedCustomer(customerId, driverId);
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
            driverStatus.locationUpdate(driverId, latitude, longitude);
            res.send({ success: true });
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
                driverStatus.online(driverId, latitude, longitude);
                res.send({ success: true });
            } else {
                ErrorMessages.sendErrorResponse(res);
            }
        } else {
            let savedOffline = await Driver.saveOffline(driverId);

            if (savedOffline) {
                driverStatus.offline(driverId, latitude, longitude);
                res.send({ success: true });
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

module.exports = router;
