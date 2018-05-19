/**
 * @copyright Homit 2018
 */
var router = require("express").Router();

/* Get user's cart */
router.get('/usercart', async function (req, res, next) {
    var signedUser = Auth.getSignedUser(req);

    if (signedUser) {
        var userId = signedUser.id;
        var cart = await Cart.getUserCart(userId);
        var response = {
            success: true,
            cart: cart
        }
        res.send(response);
    } else {
        res.json({
            error: {
                code: "C001",
                "ui_message": "User is not signed in"
            }
        });
    }
});


/* Modify item in user's cart */
router.post('/modifyitem', async function (req, res, next) {
    var depotId = req.body.depot_id;
    var quantity = req.body.quantity;
    var signedUser = Auth.getSignedUser(req);

    if (signedUser) {
        var userId = signedUser.id;
        var result = await Cart.modifyProductInCart(userId, depotId, quantity);
        var isSuccess = false;
        if (result) {
            isSuccess = true;
        }
        var response = {
            success: isSuccess
        };
        res.send(response);
    } else {
        res.json({
            error: {
                code: "C001",
                "ui_message": "User is not signed in"
            }
        });
    }
});

/* Clears user's cart */
router.post('/clear', async function (req, res, next) {
    var signedUser = Auth.getSignedUser(req);
    if (signedUser) {
        var userId = signedUser.id;
        var result = await Cart.clearCart(userId);
        var isSuccess = false;
        if (result) {
            isSuccess = true;
        }
        var response = {
            success: isSuccess
        };
        res.send(response);
    } else {
        res.json({
            error: {
                code: "C001",
                "ui_message": "User is not signed in"
            }
        });
    }
});

module.exports = router;