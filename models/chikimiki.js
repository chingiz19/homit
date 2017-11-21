/**
 * @copyright Homit 2017
 */

var connector = require('net');
var pub = {};
var outputStream;

connector.createServer(function (connection) {
    console.log('Connection to ChikiMiki has been established \n\n');
    connection.writable = true;
    outputStream = connection;

    connection.on('data', function (data) {
        receiver(JSON.parse(data));
    });

    connection.on('close', function (data) {
        console.log("ChikiMiki has been disconnected.");
    });

    connection.on('error', function (data) {
        console.log("Error has been occurred.");
    })

}).listen(6262, 'localhost', function () {
    console.log('Waiting for ChikiMiki at port 6262')
});

var receiver = function (jsonResponse) {
    if (jsonResponse.action == "chikimiki_response_to_driver") {
        var driverIdString = jsonResponse.details.driver_id;
        var orderIdString = jsonResponse.details.order_id;
        var storeIdString = jsonResponse.details.store_id;

        var driverId = driverIdString.split("_")[1];
        var orderId = orderIdString.split("_")[1];

        console.log("order_id is: " + orderIdString);
        var storeId = storeIdString.split("_")[1];

        var data = {
            driver_id: driverId,
            store_id: storeId,
            date_assigned: "CURRENT_TIMESTAMP"
        };

        var key = {
            id: orderId
        };

        // Update orders_history table
        db.updateQuery(db.dbTables.orders_history, [data, key]).then(function (updated) {

            // Build json
            var storekey = {
                id: storeId
            };
            db.selectAllWhere(db.dbTables.catalog_stores, storekey).then(function (dbStore) {

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
                    });
                });
            });
        });
    } else {
        console.log("Something went wrong");
    }

};

pub.send = function (json) {
    console.log(JSON.stringify(json) + "\n");
    outputStream.write(JSON.stringify(json) + "\n");
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
