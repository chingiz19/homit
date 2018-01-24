/**
 * @copyright Homit 2018
 */
var router = require("express").Router();

/* Get user's cart */
router.get('/usercart', function (req, res, next) {
    var signedUser = Auth.getSignedUser(req);

    if (!signedUser) {
        res.json({
            error: {
                code: "C001",
                "ui_message": "User is not signed in"
            }
        });
    } else {
        var userId = signedUser.id;
        Cart.getUserCart(userId).then(function (cart) {
            var response = {
                success: true,
                cart: cart
            }
            res.send(response);
        });
    }
});


/* Modify item in user's cart */
router.post('/modifyitem', function (req, res, next) {
    var depotId = req.body.depot_id;
    var quantity = req.body.quantity;
    var signedUser = Auth.getSignedUser(req);
    if (!signedUser) {
        res.json({
            error: {
                code: "C001",
                "ui_message": "User is not signed in"
            }
        });
    } else {
        var userId = signedUser.id;
        Cart.modifyProductInCart(userId, depotId, quantity).then(function (result) {
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

/* Clears user's cart */
router.post('/clear', function (req, res, next) {
    var signedUser = Auth.getSignedUser(req);
    if (!signedUser) {
        res.json({
            error: {
                code: "C001",
                "ui_message": "User is not signed in"
            }
        });
    } else {
        var userId = signedUser.id;

        Cart.clearCart(userId).then(function (result) {
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