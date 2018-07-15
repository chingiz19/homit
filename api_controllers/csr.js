/**
 * @copyright Homit 2018
 */

var router = require("express").Router();

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
    var orderId = req.body.order_id;
    if (!orderId) {
        return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
    } else {
        var data = await Orders.getOrderItemsById(orderId);
        res.json({
            success: true,
            order: data
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
