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

router.post('/generateCoupon', async function (req, res) {
    let privacy_type = req.body.privacy_type;
    let visible = req.body.visible;
    let date_expiry = req.body.date_expiry;
    let date_start = req.body.date_start;
    let if_total_more = req.body.if_total_more;
    let total_price_off = req.body.total_price_off === '' ? undefined : req.body.total_price_off;
    let storeTypeName = req.body.store_type_id === '' ? undefined : req.body.store_type_id;
    let unionName = req.body.union_id === '' ? undefined : req.body.union_id;
    let message_invoice = req.body.message_invoice;
    let message = req.body.message;
    let customerName = req.body.customer_name;
    let customerEmail = req.body.customer_email;
    let justCode = req.body.just_code;

    if (privacy_type && date_expiry && (date_expiry != "") && date_start && (date_start != "") && if_total_more && total_price_off && (storeTypeName || unionName) && visible != undefined && justCode != undefined && message_invoice && message && (justCode || (customerName || customerEmail))) {
        let code = HelperUtils.generateRandomID(10);
        let union_id, store_type_id;
        let assignedBy = undefined;

        if (unionName) {
            let union = await Catalog.getUnionInfoByName(unionName);
            union_id = union.id;
            assignedBy = `"${union.display_name}" stores`;
        } else if (storeTypeName) {
            let store = await Catalog.getStoreTypeInfo(storeTypeName);
            store_type_id = store.id;
            assignedBy = `"${store.display_name}" store`;
        }

        let localObject = {
            date_expiry: date_expiry,
            date_start: date_start,
            privacy_type: privacy_type,
            visible: visible,
            code: code,
            if_total_more: if_total_more,
            total_price_off: total_price_off,
            store_type_id: store_type_id,
            union_id: union_id,
            message_invoice: message_invoice,
            message: message
        }

        let result = await db.insertQuery(db.tables.catalog_coupons, localObject);

        return res.send({
            success: result && result.affectedRows > 0 && (justCode || await Email.sendSurveyCompletionWithCoupon(customerName, customerEmail, code, total_price_off, assignedBy)),
            "code": code
        });
    }

    return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
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

router.post('/getstoreunions', async function (req, res) {
    let result = await Catalog.getAllStoreUnions();
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
