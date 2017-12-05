/**
 * @copyright Homit 2017
 */

var SECRET_KEY = "hF)Zf:NR2W+gBGF]"
var connector = require('net');
var pub = {};
var outputStream;
var cmConnection = new connector.Socket();

//CM is listening at port 6262 on localhost only!
cmConnection.connect(6262, '127.0.0.1', function () {
    var verification = {
        "action": "verify_server",
        "key": SECRET_KEY
    }
    cmConnection.write(" "+JSON.stringify(verification)+ "\n");
    outputStream = cmConnection;
    Logger.log("Connection to CM established");
});

cmConnection.on('data', function (data) {
    receiver(JSON.parse(data));
});

cmConnection.on('close', function (data) {
    Logger.log("ChikiMiki has been disconnected.");
    //it is a serious issue if this happens
    //TODO send text message to directors (means CM has been shut down). 
});

cmConnection.on('error', function (data) {
    Logger.log("Error has been occurred. Here");
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

        // Update orders_history table
        db.updateQuery(db.dbTables.orders_history, [data, key]).then(function (updated) {

            // Build json
            var storeKey = {
                id: storeId
            };
            db.selectAllWhere(db.dbTables.catalog_stores, storeKey).then(function (dbStore) {

                var jsonStore = {
                    id: storeIdString,
                    address: dbStore[0].address,
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
                            first_name: user.first_name,
                            last_name: user.last_name,
                            dob: user.birth_date,
                            phone: user.phone_number,
                            address: orderDetails.delivery_address,
                            // comments: orderDetails.comments,
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
                            driverId, storeId, orderId, jsonResponse.details.nextnodeid, storeAdded);
                    });
                });
            });
        });
    } else {
        Logger.log("Something went wrong");
    }

};

pub.send = function (json) {
    Logger.log(JSON.stringify(json) + "\n");
    outputStream.write(" "+JSON.stringify(json) + "\n");   
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

module.exports = pub;
