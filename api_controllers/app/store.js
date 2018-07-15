/**
 * @copyright Homit 2018
 */

var router = require("express").Router();
const TOKEN_EXPIRY = '8760h'; //1 year

router.post('/signin', async function (req, res, next) {
    var userName = req.body.user_name;
    var password = req.body.password;

    if (userName && password) {
        var storeId = await Store.authenticate(userName, password);
        if (storeId) {
            let storeData = { store_id: storeId }
            let authToken = JWTToken.createToken(storeData, TOKEN_EXPIRY);
            let store = await Store.getStoreInfo(storeId);
            Auth.signSession(req, storeId, Auth.RolesJar.STORE);
            var response = {
                success: true,
                store: store,
                auth_token: authToken
            };
            res.send(response);
        } else {
            return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.INVALID_CREDENTIALS);
        }
    } else {
        return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
    }
});

router.post('/authenticate', Auth.validate(Auth.RolesJar.STORE), async function (req, res, next) {
    let storeId = req.session.store_id;
    var store = await Store.getStoreInfo(storeId);
    var response = {
        success: true,
        store: store
    };
    res.send(response);
});

router.post('/getpendingorders', Auth.validate(Auth.RolesJar.STORE), async function (req, res, next) {
    let storeId = req.session.store_id;
    var pendingOrders = await Orders.getPendingOrdersWithItemsByStoreId(storeId);
    var response = {
        success: true,
        orders: pendingOrders
    };
    res.send(response);
});

router.post('/getallorders', Auth.validate(Auth.RolesJar.STORE), async function (req, res, next) {
    let storeId = req.session.store_id;
    var allOrders = await Orders.getAllOrdersWithItemsByStoreId(storeId);
    var response = {
        success: true,
        orders: allOrders
    };
    res.send(response);
});

router.post('/getpreviousorders', Auth.validate(Auth.RolesJar.STORE), async function (req, res, next) {
    let storeId = req.session.store_id;
    var prevOrders = await Orders.getPreviousOrdersWithItemsByStoreId(storeId);
    var response = {
        success: true,
        orders: prevOrders
    };
    res.send(response);
});

router.post('/itempicked', Auth.validate(Auth.RolesJar.STORE), async function (req, res, next) {
    var orderIds = req.body.order_ids;
    var depotId = req.body.depot_id;
    var picked = req.body.item_picked;

    if (orderIds && depotId && picked != undefined) {
        await Orders.updateItemPicked(orderIds, depotId, picked);
        for (let i = 0; i < orderIds.length; i++) {
            if (picked) {
                Orders.checkForStoreReady(orderIds[i]);
            } else {
                Orders.checkForStoreNotReady(orderIds[i]);
            }
        }
        var response = {
            success: true,
            item_picked: picked
        };
        res.send(response);
    } else {
        Logger.log.verbose("Store 'itempicked' error", {
            store_id: Auth.getStore(req).id,
            orderId: orderIds,
            depotId: depotId,
            picked: picked
        });
        Auth.invalidate(req);
        return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
    }
});

module.exports = router;
