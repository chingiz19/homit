/**
 * @copyright Homit 2018
 */
var router = require("express").Router();

/* Get user's cart */
router.get('/usercart', Auth.validate(Auth.RolesJar.CUSTOMER), async function (req, res, next) {
    let signedUser = Auth.getSignedUser(req);

    if (signedUser) {
        let userId = signedUser.id;
        let cart = await Cart.getUserCart(userId);

        if (cart == false) {
            ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.CART_ERROR);
        } else {
            let response = {
                success: true,
                cart: cart
            };
            res.send(response);
        }
    } else {
        ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.USER_NOT_SIGNED);
    }
});

/* Modify item in user's cart */
router.post('/modifyitem', async function (req, res, next) {
    let depotId = req.body.depot_id;
    let quantity = req.body.quantity;
    let signedUser = Auth.getSignedUser(req);

    if (signedUser) {
        let userId = signedUser.id;
        let result = await Cart.modifyProductInCart(userId, depotId, quantity);
        let isSuccess = false;
        if (result) {
            isSuccess = true;
        }
        let response = {
            success: isSuccess
        };
        res.send(response);
    } else {
        ErrorMessages.sendBadRequest(res, ErrorMessages.UIMessageJar.USER_NOT_SIGNED);
    }
});

/* Clears user's cart */
router.post('/clear', async function (req, res, next) {
    let signedUser = Auth.getSignedUser(req);
    if (signedUser) {
        let userId = signedUser.id;
        let result = await Cart.clearCart(userId);
        let isSuccess = false;
        if (result) {
            isSuccess = true;
        }
        let response = {
            success: isSuccess
        };
        res.send(response);
    } else {
        ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.USER_NOT_SIGNED);
    }
});

module.exports = router;