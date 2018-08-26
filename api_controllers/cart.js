/**
 * @copyright Homit 2018
 */
let router = require("express").Router();

/* Get user's cart */
router.get('/usercart', Auth.validate(Auth.RolesJar.CUSTOMER), async function (req, res) {
    let userId = Auth.getSignedUser(req).id;
    let cart = await Cart.getUserCart(userId);
    return res.send({
        success: cart && true,
        cart: cart
    });
});

/* Modify item in user's cart */
router.post('/modifyitem', async function (req, res) {
    let depotId = req.body.depot_id;
    let quantity = req.body.quantity;
    let signedUser = Auth.getSignedUser(req);

    if (!signedUser) {
        return ErrorMessages.sendBadRequest(res, ErrorMessages.UIMessageJar.USER_NOT_SIGNED);
    }

    if (depotId && quantity != undefined) {
        let userId = signedUser.id;
        return res.send({
            success: await Cart.modifyProductInCart(userId, depotId, quantity) && true
        });
    } else {
        return ErrorMessages.sendBadRequest(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
    }
});

/* Clears user's cart */
router.post('/clear', async function (req, res) {
    let signedUser = Auth.getSignedUser(req);

    if (signedUser) {
        let userId = signedUser.id;
        return res.send({
            success: await Cart.clearCart(userId) && true
        });
    } else {
        return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.USER_NOT_SIGNED);
    }
});

module.exports = router;