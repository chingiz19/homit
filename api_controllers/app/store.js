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
            Auth.signStoreSession(req, storeId);
            var response = {
                success: true,
                store: store,
                auth_token: authToken
            };
            res.send(response);
        } else {
            return errorMessages.sendInvalidCredentials(res);
        }
    } else {
        return errorMessages.sendMissingParams(res);
    }
});

router.post('/authenticate', async function (req, res, next) {
    if (Auth.validateStore(req)) {
        let storeId = req.session.store_id;
        var store = await Store.getStoreInfo(storeId);
        var response = {
            success: true,
            store: store
        };
        res.send(response);
    } else {
        Auth.invalidate(req);
        return errorMessages.sendInvalidToken(res);
    }
});

router.post('/getpendingorders', async function (req, res, next) {
    if (Auth.validateStore(req)) {
        let storeId = req.session.store_id;
        var pendingOrders = await Orders.getPendingOrdersWithItemsByStoreId(storeId);
        var response = {
            success: true,
            orders: pendingOrders
        };
        res.send(response);
    } else {
        Auth.invalidate(req);
        return errorMessages.sendInvalidToken(res);
    }
});

router.post('/getallorders', async function (req, res, next) {
    if (Auth.validateStore(req)) {
        let storeId = req.session.store_id;
        var allOrders = await Orders.getAllOrdersWithItemsByStoreId(storeId);
        var response = {
            success: true,
            orders: allOrders
        };
        res.send(response);
    } else {
        Auth.invalidate(req);
        return errorMessages.sendInvalidToken(res);
    }
});

router.post('/getpreviousorders', async function (req, res, next) {
    if (Auth.validateStore(req)) {
        let storeId = req.session.store_id;
        var prevOrders = await Orders.getPreviousOrdersWithItemsByStoreId(storeId);
        var response = {
            success: true,
            orders: prevOrders
        };
        res.send(response);
    } else {
        Auth.invalidate(req);
        return errorMessages.sendInvalidToken(res);
    }
});

router.post('/itempicked', async function (req, res, next) {
    var orderIds = req.body.order_ids;
    var depotId = req.body.depot_id;
    var picked = req.body.item_picked;

    if (orderIds && depotId && picked != undefined) {
        if (Auth.validateStore(req)) {
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
            Auth.invalidate(req);
            return errorMessages.sendInvalidToken(res);
        }
    } else {
        Auth.invalidate(req);
        return errorMessages.sendMissingParams(res);
    }
});

module.exports = router;
