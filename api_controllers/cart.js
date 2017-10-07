/**
 * @copyright Homit 2017
 */
var router = require("express").Router();

/**
 * Gets user's cart
 */
router.get('/usercart', function (req, res, next) {
    if (!req.session.user) {
        res.json({
            error: {
                code: "C001",
                "ui_message": "User is not signed in"
            }
        });
    } else {
        var user_id = req.session.user.id;
        Cart.getUserCart(user_id).then(function (cart) {
            var response = {
                success: true,
                cart: cart
            }
            res.send(response);
        });
    }
});

/**
 * Modifies item in user's cart
 */
router.post('/modifyitem', function (req, res, next) {
    var depot_id = req.body.depot_id;
    var quantity = req.body.quantity;
    if (!req.session.user) {
        res.json({
            error: {
                code: "C001",
                "ui_message": "User is not signed in"
            }
        });
    } else {
        var user_id = req.session.user.id;
        Cart.modifyProductInCart(user_id, depot_id, quantity).then(function (result) {
            var isSuccess = false;
            if (result != false) {
                isSuccess = true;
            }
            var response = {
                success: isSuccess
            };
            res.send(response);
        });
    }
});

/**
 * Clears user's cart
 */
router.post('/clear', function (req, res, next) {
    if (!req.session.user) {
        res.json({
            error: {
                code: "C001",
                "ui_message": "User is not signed in"
            }
        });
    } else {
        var user_id = req.session.user.id;
        Cart.clearCart(user_id).then(function (result) {
            var isSuccess = false;
            if (result != false) {
                isSuccess = true;
            }
            var response = {
                success: isSuccess
            };
            res.send(response);
        });
    }
});

module.exports = router;