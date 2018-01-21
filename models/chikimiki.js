/**
 * @copyright Homit 2018
 */

var SECRET_KEY = "hF)Zf:NR2W+gBGF]"
var connector = require('net');
var pub = {};
var outputStream;
var cmConnection = new connector.Socket();

/* Building metadata for log */
var logMeta = {
    directory: __filename
}

/* CM is listening at port 6262 on only localhost! */
cmConnection.connect(6262, '127.0.0.1', function () {
    var verification = {
        "action": "verify_server",
        "key": SECRET_KEY
    }
    cmConnection.write(" " + JSON.stringify(verification) + "\n");
    outputStream = cmConnection;
    Logger.log.debug("Connection to CM established", logMeta);
});

/* Listener for incoming data */
cmConnection.on('data', function (data) {
    receiver(JSON.parse(data));
});

/* Lost connection listener */
cmConnection.on('close', function (data) {
    Logger.log.warn("Connection to CM has been lost", logMeta);
    SMS.alertDirectors("CM is down!!!");
});

/* Connection error listener */ 
cmConnection.on('error', function (data) {
    Logger.log.error("CM connection is experiencing issues", logMeta);
})

var receiver = function (jsonResponse) {
    if (jsonResponse.action == "chikimiki_response_to_driver") {
        var driverIdString = jsonResponse.details.driver_id;
        var orderIdString = jsonResponse.details.order_id;
        var storeIdString = jsonResponse.details.store_id;
        var storeAdded = jsonResponse.details.store_added;

        var driverId = driverIdString.split("_")[1];
        var orderId = orderIdString.split("_")[1];
        var storeId = storeIdString.split("_")[1];

        var data = {
            driver_id: driverId,
            store_id: storeId,
            date_assigned: Date.now()
        };

        var key = {
            id: orderId
        };

        // Updating orders_history table
        db.updateQuery(db.dbTables.orders_history, [data, key]).then(function (updated) {

            // Building json
            var storeKey = {
                id: storeId
            };
            db.selectAllWhere(db.dbTables.catalog_stores, storeKey).then(function (dbStore) {
                var jsonStore = {
                    id: storeIdString,
                    address: dbStore[0].address,
                    phone_number: dbStore[0].phone_number,
                    name: dbStore[0].name,
                    nextnodeid: jsonResponse.details.nextnodeid
                };

                Orders.getOrderById(orderId).then(function (products) {

                    var jsonOrder = {
                        id: orderIdString,
                        store: storeIdString,
                        products: products
                    };

                    Orders.getUserWithOrderByOrderId(orderId).then(function (result) {
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
                            // comments: orderDetails.comments,      //TODO: Elnar and Zaman add them in FE and BE
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

                        Driver.dispatchOrder(
                            driverId, storeId, orderId, jsonResponse.details.nextnodeid, storeAdded)
                            .then(function (dispatched) {
                                Email.sendOrderSlip(jsonFinal.details);
                            });
                    });
                });
            });
        });
    } else {
        Logger.log.error("Error while processing order from CM due to wrong 'action' value received from CM", logMeta);
    }
};

pub.send = function (json) {
    Logger.log.debug('Sending order to CM' + json + "\n", logMeta);
    if (outputStream) {
        outputStream.write(" " + JSON.stringify(json) + "\n");
    } else {
        Logger.log.error("Could not send order to CM", logMeta);
    }
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
    CM.send(newOrder);
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
