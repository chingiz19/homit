/**
 * @copyright Homit 2018
 */
var pub = {};

/* Building metadata for log */
var logMeta = {
    directory: __filename
}

pub.receiver = async function (jsonResponse) {
    if (jsonResponse.action == "chikimiki_response_to_driver") {
        var driverIdString = jsonResponse.details.driver_id;
        var orderIdString = jsonResponse.details.order_id;
        var storeIdString = jsonResponse.details.store_id;
        var storeAdded = jsonResponse.details.store_added;

        var driverId = driverIdString.split("_")[1];
        var orderId = orderIdString.split("_")[1];
        var storeId = storeIdString.split("_")[1];

        Orders.updateDateAssigned(orderId, storeId, driverId);

        // Building json

        var dbStore = await Store.getStoreInfo(storeId);

        var jsonStore = {
            id: storeIdString,
            address: dbStore.store_address,
            phone_number: dbStore.phone_number,
            name: dbStore.store_name,
            nextnodeid: jsonResponse.details.nextnodeid
        };

        var products = await Orders.getOrderItemsById(orderId);

        var jsonOrder = {
            id: orderIdString,
            store: storeIdString,
            products: products
        };

        var result = await Orders.getUserWithOrderByOrderId(orderId);
        var user = result.user;
        var orderDetails = result.order;
        var transactionDetails = result.transaction;

        var jsonCustomer = {
            id: user.id_prefix + user.id,
            email: user.user_email,
            first_name: user.first_name,
            last_name: user.last_name,
            dob: user.birth_date,
            phone: transactionDetails.phone_number,
            address: transactionDetails.delivery_address,
            comments: transactionDetails.driver_instruction,
            unit_number: transactionDetails.unit_number,
            card_digits: transactionDetails.card_digits,
            order: jsonOrder
        };

        var jsonFinal = {
            action: "dispatch",
            details: {
                store: jsonStore,
                customer: jsonCustomer
            }
        };

        /* Notify stakeholders */
        NM.sendToDriver(driverIdString, jsonFinal);
        Store.newOrder(jsonFinal.details.store.id);

        Driver.dispatchOrder(driverId, storeId, orderId, jsonResponse.details.nextnodeid, storeAdded);

        if (jsonStore.name.toLowerCase().includes("liquor")) {
           Email.sendStoreAssignedEmail({
               store_name: dbStore.store_name,
               store_address: dbStore.store_address,
               user_name: user.first_name,
               user_email: user.user_email,
               order_id: orderIdString
           });
        }
    } else if (jsonResponse.action == "chikimiki_report") {
        NM.sendToCSR(jsonResponse.details);
    } else {
        Logger.log.error("Error while processing order from CM due to wrong 'action' value received from CM", logMeta);
    }
};

module.exports = pub;
