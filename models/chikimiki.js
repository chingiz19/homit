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
        var dbStore = await db.selectAllWhereLimitOne(db.tables.catalog_stores, storeKey);
        var jsonStore = {
            id: storeIdString,
            address: dbStore[0].address,
            phone_number: dbStore[0].phone_number,
            name: dbStore[0].name,
            store_type: dbStore[0].store_type,
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
        NM.sendToDriver(driverIdString, jsonFinal);

        //Zaman is this the right place
        Store.newOrder(jsonFinal.details.store.id);

        await Driver.dispatchOrder(driverId, storeId, orderId, jsonResponse.details.nextnodeid, storeAdded);

        //Add to email temp
        var emailTransaction = {};
        var emailOrders = {};
        var emailOrder = {};

        var emailTransactionTemp = await Email.getTransactionEmail(orderDetails.order_transaction_id);
        if (emailTransactionTemp) {
            emailTransaction = JSON.parse(emailTransactionTemp);

            if (emailTransaction.orders) {
                emailOrders = emailTransaction.orders;
            }
        }

        var storeType = await Catalog.getStoreTypeById(jsonStore.store_type);

        emailOrder = jsonOrder;
        emailOrder.store = jsonStore;
        emailOrder.store_type_display_name = storeType.display_name;

        emailOrders[storeType.name] = emailOrder;
        emailTransaction.orders = emailOrders;

        // Check if email is ready to send
        var allAssigned = await Orders.areAllDispatched(orderDetails.order_transaction_id);
        if (allAssigned) {
            emailTransaction.customer = jsonCustomer;

            Email.sendOrderSlip(emailTransaction);

            await Email.deleteTransactionEmail(orderDetails.order_transaction_id);
        } else {
            await Email.saveTransactionEmail(orderDetails.order_transaction_id, emailTransaction);
        }
    } else if (jsonResponse.action == "chikimiki_report") {
        NM.sendToCSR(jsonResponse.details);
    }else {
        Logger.log.error("Error while processing order from CM due to wrong 'action' value received from CM", logMeta);
    }
};

module.exports = pub;
