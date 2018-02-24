var router = require("express").Router();

router.post('/findusersbyphone', Auth.validateCsr(), function (req, res, next) {
    var phone_number = req.body.phone_number;
    if (!phone_number) {
        res.status(403).json({
            error: {
                "code": "U000",
                "dev_message": "Missing params",
                "required_params": ["phone_number"]
            }
        });
    } else {
        var result = [];
        return User.findUsersByPhoneWithHistory(phone_number).then(function (users) {
            result = result.concat(users);
            return User.findGuestUsersByPhone(phone_number).then(function (guests) {
                result = result.concat(guests);
                res.json({
                    success: true,
                    users: result
                });
            });
        });
    }
});

router.post('/findusersbyemail', Auth.validateCsr(), function (req, res, next) {
    var user_email = req.body.user_email;
    if (!user_email) {
        res.status(403).json({
            error: {
                "code": "U000",
                "dev_message": "Missing params",
                "required_params": ["user_email"]
            }
        });
    } else {
        var result = [];
        return User.findUsersByEmailWithHistory(user_email).then(function (users) {
            result = result.concat(users);
            return User.findGuestUsersByEmail(user_email).then(function (guests) {
                result = result.concat(guests);
                res.json({
                    success: true,
                    users: result
                });
            });
        });
    }
});

router.post('/finduserbyorderid', Auth.validateCsr(), async function (req, res, next) {
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
        res.status(403).json({
            error: {
                "code": "U000",
                "dev_message": "Missing params",
                "required_params": ["user_email"]
            }
        });
    }
});

router.post('/viewordertransactions', Auth.validateCsr(), async function (req, res, next) {
    var userId = req.body.user_id;
    var guestId = req.body.guest_id;

    if (!userId && !guestId) {
        res.status(403).json({
            error: {
                "code": "U000",
                "dev_message": "Missing params",
                "required_params": ["user_id", "guest_id"]
            }
        });
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

router.post('/vieworders', Auth.validateCsr(), async function (req, res, next) {
    var orderTransactionId = req.body.transaction_id;
    if (!orderTransactionId) {
        res.status(403).json({
            error: {
                "code": "U000",
                "dev_message": "Missing params",
                "required_params": ["transaction_id"]
            }
        });
    } else {
        var data = await Orders.getOrdersByTransactionId(orderTransactionId);
        res.json({
            success: true,
            orders: data
        });
    }
});

router.post('/getorder', Auth.validateCsr(), async function (req, res, next) {
    var orderId = req.body.order_id;

    if (!orderId) {
        res.status(403).json({
            error: {
                "code": "U000",
                "dev_message": "Missing params",
                "required_params": ["order_id"]
            }
        });
    } else {
        var data = await Orders.getOrderItemsById(orderId);
        res.json({
            success: true,
            order: data
        });
    }
});

router.get('/pendingorders', Auth.validateCsr(), async function (req, res, next) {
    var pendingOrders = await Orders.getPendingOrders();
    res.json({
        success: true,
        orders: pendingOrders
    });
});

module.exports = router;