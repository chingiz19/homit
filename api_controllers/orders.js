var router = require("express").Router();

router.post('/findusersbyphone', Auth.validateAdmin(), function (req, res, next) {
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

router.post('/findusersbyemail', Auth.validateAdmin(), function (req, res, next) {
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

router.post('/vieworders', Auth.validateAdmin(), function (req, res, next) {
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
        if (!userId) {
            Orders.getOrdersByGuestId(guestId).then(function (data) {
                res.json({
                    success: true,
                    orders: data
                });
            });
        } else {
            Orders.getOrdersByUserId(userId).then(function (data) {
                res.json({
                    success: true,
                    orders: data
                });
            });
        }
    }
});

router.post('/getorder', Auth.validateAdmin(), function (req, res, next) {
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
        Orders.getOrderById(orderId).then(function (data) {
            Orders.getUserWithOrderByOrderId(orderId).then(function (result) {
                if (result != false) {
                    res.json({
                        success: true,
                        user: result.user,
                        orders: data
                    });
                } else {
                    res.json({
                        success: false
                    });
                }

            });
        });
    }
});

module.exports = router;