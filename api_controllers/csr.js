/**
 * @copyright Homit 2018
 */

let router = require("express").Router();

router.post('/apiorder', async function (req, res) {
    let firstN = req.body.first_name;
    let lastN = req.body.last_name;
    let phoneNumber = req.body.phone_number;
    let address = req.body.address;
    let storeTypeName = req.body.store_type_name;
    let storeTypeNumber = req.body.store_type_number;
    let orderNumber = req.body.order_number;
    let driverInstruction = req.body.driver_instruction;

    let phoneRegex = new RegExp("([0-9])");

    if (!phoneRegex.test(phoneNumber)) {
        return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.WRONG_FORMAT);
    }

    if (driverInstruction) {
        driverInstruction = " | Order # " + orderNumber;
    } else {
        driverInstruction = "Order # " + orderNumber;
    }

    if (firstN && lastN && phoneNumber && address && storeTypeName && storeTypeNumber && orderNumber && driverInstruction) {
        res.send({ success: await Orders.submitApiOrderByCsr(firstN, lastN, phoneNumber, address, storeTypeName, storeTypeNumber, orderNumber, driverInstruction) });
    } else {
        return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
    }
});

router.post('/bulkapiorder', async function (req, res) {
    let inArray = req.body.orders_array;
    let qualityCheckCounter = 0;

    if (inArray && inArray.length > 0) {
        for (let i in inArray) {
            let firstN = inArray[i].first_name;
            let lastN = inArray[i].last_name;
            let phoneNumber = inArray[i].phone_number;
            let address = inArray[i].address;
            let storeTypeName = inArray[i].store_type_name;
            let storeTypeNumber = inArray[i].store_type_number;
            let orderNumber = inArray[i].order_number;
            let driverInstruction = inArray[i].driver_instruction;

            let phoneRegex = new RegExp("([0-9])");

            if (!phoneRegex.test(phoneNumber)) {
                return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.WRONG_FORMAT);
            }

            if (driverInstruction === "") {
                driverInstruction = "Order # " + orderNumber;
            } else {
                driverInstruction = " | Order # " + orderNumber;
            }

            if (firstN && lastN && phoneNumber && address && storeTypeName && storeTypeNumber && orderNumber && driverInstruction) {
                if (await Orders.submitApiOrderByCsr(firstN, lastN, phoneNumber, address, storeTypeName, storeTypeNumber, orderNumber, driverInstruction)) {
                    qualityCheckCounter++;
                }
            } else {
                return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
            }
        }
    } else {
        return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
    }

    return res.send({ success: (qualityCheckCounter == inArray.length) });
});

router.post('/apiorders', async function (req, res) {
    let result = await Orders.getApiOrders();
    res.send({
        success: result && true,
        table: result
    });
});

router.post('/refreshreport', async function (req, res) {
    return res.send({ success: await NM.sendToCM({ "action": "refresh_report" }) });
});

router.post('/getstores', async function (req, res) {
    let result = await Catalog.getAllStores();
    return res.send({
        success: result && true,
        array: result
    });
});

router.post('/findusersbyphone', async function (req, res, next) {
    var phoneNumber = req.body.phone_number;
    if (phoneNumber) {
        var users = await Orders.getUsersByOrderPhone(phoneNumber);
        var guests = await Orders.getGuestsByOrderPhone(phoneNumber);
        users = users.concat(guests);

        var response = {
            success: true,
            users: users
        };
        res.send(response);
    } else {
        return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
    }
});

router.post('/findusersbyemail', async function (req, res, next) {
    var email = req.body.user_email;
    if (email) {
        var users = await User.findUsersByEmailWithHistory(email);
        var guests = await User.findGuestUsersByEmail(email);
        users = users.concat(guests);
        var response = {
            success: true,
            users: users
        };
        res.send(response);
    } else {
        return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
    }
});

router.post('/finduserbyorderid', Auth.validate(Auth.RolesJar.CSR), async function (req, res, next) {
    var orderId = req.body.order_id;
    if (orderId) {
        var result = await Orders.getUserWithOrderByOrderId(orderId);
        if (result) {
            res.json({
                success: true,
                user: result.user
            });
        } else {
            res.json({
                success: false
            });
        }
    } else {
        return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
    }
});

router.post('/viewordertransactions', Auth.validate(Auth.RolesJar.CSR), async function (req, res, next) {
    var userId = req.body.user_id;
    var guestId = req.body.guest_id;

    if (!userId && !guestId) {
        return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
    } else {
        var data;
        if (!userId) {
            data = await Orders.getOrderTransactionsByGuestId(guestId);
        } else {
            data = await Orders.getOrderTransactionsByUserId(userId);
        }

        res.json({
            success: true,
            transactions: data
        });
    }
});

router.post('/vieworders', Auth.validate(Auth.RolesJar.CSR), async function (req, res, next) {
    var orderTransactionId = req.body.transaction_id;
    if (!orderTransactionId) {
        return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
    } else {
        var data = await Orders.getOrdersByTransactionId(orderTransactionId);
        res.json({
            success: true,
            orders: data
        });
    }
});

router.post('/getorder', Auth.validate(Auth.RolesJar.CSR), async function (req, res, next) {
    let orderId = req.body.order_id;
    if (!orderId) {
        return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
    } else {
        let result = await Orders.getOrderItemsById(orderId);
        res.json({
            success: result && true,
            order: result
        });
    }
});

router.get('/pendingorders', Auth.validate(Auth.RolesJar.CSR), async function (req, res, next) {
    var pendingOrders = await Orders.getPendingOrders();
    res.json({
        success: true,
        orders: pendingOrders
    });
});

router.get('/activedrivers', Auth.validate(Auth.RolesJar.CSR), function (req, res, next) {
    Driver.getActiveDrivers().then(function (activeDrivers) {
        res.json({
            success: true,
            drivers: activeDrivers
        });
    });
});

router.post('/getdriverroutes', Auth.validate(Auth.RolesJar.CSR), function (req, res, next) {
    var driverId = req.body.driver_id;
    Driver.getRoutes(driverId).then(function (routes) {
        res.json({
            success: true,
            routes: routes
        });
    });
});

/* View logs from CSR's browser */
router.post('/streamlog', Auth.validate(Auth.RolesJar.CSR), function (req, res, next) {
    Logger.streamServerLogs(res);
});

module.exports = router;
