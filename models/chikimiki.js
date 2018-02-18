/**
 * @copyright Homit 2018
 */
var pub = {};

var SECRET_KEY = "hF)Zf:NR2W+gBGF]"
var connector = require('net');
var CM_DEFAULT_EMIT = "message";
var cmSocketIOServer = require("http").createServer();
var SocketIO = require("socket.io")(cmSocketIOServer, {
    pingInterval: 2100,
    pingTimeout: 2000
});

var emailTempStorage = {};

/* Building metadata for log */
var logMeta = {
    directory: __filename
}


/* 
*  Socke.io has it is own hand - shaker
*  Connection listener that iniates all other listeners 
*  once connection is established
*/
SocketIO.on('connection', function (client) {
    var verification = {
        "action": "verify_server",
        "key": SECRET_KEY
    }
    CM.send(verification);
    Logger.log.debug("Connection to CM established", logMeta);

    client.on('data', function (data) {
        receiver(JSON.parse(data));
    });

    client.on('disconnect', function () {
        Logger.log.warn("Connection to CM has been lost", logMeta);
        SMS.alertDirectors("\u26A0 CM is down \u26A0");
    });

    /* CM error listener that will be logged here as well */
    client.on('error', function (data) {
        Logger.log.error("CM connection is experiencing issues", logMeta);
    })
});


/* CM is listening at port 6262 on only localhost! */
cmSocketIOServer.listen(6262, function () {
    Logger.log.verbose('Listening for CM at 6262');
});


var receiver = async function (jsonResponse) {
    if (jsonResponse.action == "chikimiki_response_to_driver") {
        var driverIdString = jsonResponse.details.driver_id;
        var orderIdString = jsonResponse.details.order_id;
        var storeIdString = jsonResponse.details.store_id;
        var storeAdded = jsonResponse.details.store_added;

        var driverId = driverIdString.split("_")[1];
        var orderId = orderIdString.split("_")[1];
        var storeId = storeIdString.split("_")[1];

        var sqlQuery = `
            UPDATE orders_history
            SET 
            driver_id = `+ driverId + `,
            store_id = ` + storeId + `,
            date_assigned = CURRENT_TIMESTAMP
            WHERE ?
        `;

        var key = {
            id: orderId
        };

        // Updating orders_history table
        await db.runQuery(sqlQuery, key);

        // Building json
        var storeKey = {
            id: storeId
        };
        var dbStore = await db.selectAllWhere(db.dbTables.catalog_stores, storeKey);
        var jsonStore = {
            id: storeIdString,
            address: dbStore[0].address,
            phone_number: dbStore[0].phone_number,
            name: dbStore[0].name,
            store_type: dbStore[0].store_type,
            nextnodeid: jsonResponse.details.nextnodeid
        };

        var products = await Orders.getOrderById(orderId);

        var jsonOrder = {
            id: orderIdString,
            store: storeIdString,
            products: products
        };

        var result = await Orders.getUserWithOrderByOrderId(orderId);
        var user = result.user;
        var orderDetails = result.order;

        var jsonCustomer = {
            id: user.id_prefix + user.id,
            email: user.user_email,
            first_name: user.first_name,
            last_name: user.last_name,
            dob: user.birth_date,
            phone: user.phone_number,
            address: orderDetails.delivery_address,
            comments: orderDetails.driver_instruction,
            card_digits: orderDetails.card_digits,
            order: jsonOrder
        };

        var jsonFinal = {
            action: "dispatch",
            details: {
                store: jsonStore,
                customer: jsonCustomer
            }
        };
        Driver.send(driverIdString, jsonFinal);

        await Driver.dispatchOrder(driverId, storeId, orderId, jsonResponse.details.nextnodeid, storeAdded);

        //Add to email temp

        // Old to be removed
        var emailTransactionOld = {};
        var emailOrdersOld = {};
        var emailOrderOld = {};

        // New
        var emailTransaction = {};
        var emailOrders = {};
        var emailOrder = {};


        // Old to be removed
        if (emailTempStorage[orderDetails.transaction_id]) {
            emailTransactionOld = emailTempStorage[orderDetails.transaction_id];

            if (emailTransactionOld.orders) {
                emailOrdersOld = emailTransactionOld.orders;
            }
        }

        // New
        var emailTransactionTemp = await Email.getTransactionEmail(orderDetails.transaction_id);
        if (emailTransactionTemp) {
            emailTransaction = JSON.parse(emailTransactionTemp);

            if (emailTransaction.orders) {
                emailOrders = emailTransaction.orders;
            }
        }

        var superCategory = await Catalog.getSuperCategoryById(jsonStore.store_type);

        // Old to be removed
        emailOrderOld = jsonOrder;
        emailOrderOld.store = jsonStore;
        emailOrderOld.super_category_display = superCategory.display_name;
        emailOrderOld.super_category_custom = superCategory.custom_name;

        // New
        emailOrder = jsonOrder;
        emailOrder.store = jsonStore;
        emailOrder.super_category_display = superCategory.display_name;
        emailOrder.super_category_custom = superCategory.custom_name;

        // Old to be removed
        emailOrdersOld[superCategory.name] = emailOrderOld;
        emailTransactionOld.orders = emailOrdersOld;
        emailTempStorage[orderDetails.transaction_id] = emailTransactionOld;

        // New
        emailOrders[superCategory.name] = emailOrder;
        emailTransaction.orders = emailOrders;

        // Check if email is ready to send
        var allAssigned = await Orders.areAllDispatched(orderDetails.transaction_id);
        if (allAssigned) {
            emailTransactionOld.customer = jsonCustomer;
            emailTransaction.customer = jsonCustomer;

            Logger.log.debug("email Old JSON is ", JSON.stringify(emailTransactionOld));
            Logger.log.debug("email New JSON is ", JSON.stringify(emailTransaction));

            Email.sendOrderSlip(emailTransactionOld);
            // Email.sendOrderSlip(emailTransaction);

            delete emailTempStorage[orderDetails.transaction_id];
            await Email.deleteTransactionEmail(orderDetails.transaction_id);
        } else {
            await Email.saveTransactionEmail(orderDetails.transaction_id, emailTransaction);
        }
    } else {
        Logger.log.error("Error while processing order from CM due to wrong 'action' value received from CM", logMeta);
    }
};


pub.send = function (json, isOrder) {
    if (isOrder) {
        Logger.log.debug('Sending order to CM \n Super category: ' + json.details.order.store_type, logMeta);
    }
    SocketIO.emit(CM_DEFAULT_EMIT, json);
};


pub.sendOrder = function (customerId, customerAddress, orderId, storeType) {
    var newOrder = {
        "action": "neworder",
        "details": {
            "customer": {
                "id": customerId,
                "address": customerAddress
            },
            "order": {
                "id": orderId,
                "store_type": storeType
            }
        }
    };
    CM.send(newOrder, true);
}


pub.cancelOrder = function (orderId, driverId) {
    var driverIdString = "d_" + driverId;
    var orderIdString = "o_" + orderId;

    var json = {
        "action": "driver_status",
        "details": {
            "driver_id": driverIdString,
            "status": "remove_order",
            "remove_order": {
                "order_id": orderIdString
            }
        }
    };
    CM.send(json);
};

module.exports = pub;
