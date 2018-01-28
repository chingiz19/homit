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
                            comments: orderDetails.driver_instruction,
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
