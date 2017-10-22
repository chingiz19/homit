var router = require("express").Router();

router.post('/findusers', Auth.validateAdmin(), function (req, res, next) {
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
        return User.findUsersByPhone(phone_number).then(function (users) {
            result = result.concat(users);
            User.findGuestUsersByPhone(phone_number).then(function (guests) {
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
            res.json({
                success: true,
                orders: data
            });
        });
    }
});

module.exports = router;