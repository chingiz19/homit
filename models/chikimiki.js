/**
 * @copyright Homit 2018
 */
let pub = {};

/* Building metadata for log */
let logMeta = { directory: __filename }

pub.receiver = async function (jsonResponse) {
    if (jsonResponse.action == "chikimiki_response_to_driver") {
        let driverId = jsonResponse.details.driver_id;
        let orderId = jsonResponse.details.order_id.split("_")[1];
        let storeId = jsonResponse.details.store_id.split('_')[1];
        let storeAdded = jsonResponse.details.store_added;
        let isApiOrder = jsonResponse.details.api_order;
        let isCustomLocation = jsonResponse.details.custom_location;

        if (!isApiOrder) {
            Orders.updateDateAssigned(orderId, storeId, driverId);

            let dbStore = await Store.getStoreInfo(storeId);
            let result = await Orders.getUserWithOrderByOrderId(orderId);
            let user = result.user;

            if (dbStore.store_name.toLowerCase().includes("liquor")) {
                Email.sendStoreAssignedEmail({
                    store_name: dbStore.store_name,
                    store_address: dbStore.store_address,
                    user_name: user.first_name,
                    user_email: user.user_email,
                    order_id: orderId
                });
            }
        } else {
            if (isCustomLocation) {
                //update to custom location table 
            }
            Orders.updateApiOrders(orderId, storeId, driverId);
        }

        let finalResult = await Driver.dispatchOrder(driverId, storeId, orderId, jsonResponse.details.nextnodeid, storeAdded, isApiOrder, isCustomLocation);

        /* Finally notify stakeholders */
        if (finalResult) {
            NM.notifyDriver(driverId);
            Store.newOrder("s_" + storeId);
        } else {
            //TODO send SMS or something to notify about this serious error
            Logger.log.error("Error while placing order received from CM", logMeta);
        }

    } else if (jsonResponse.action == "chikimiki_report") {
        NM.sendToCSR(jsonResponse.details);
    } else {
        Logger.log.error("Error while processing order from CM due to wrong 'action' value received from CM", logMeta);
    }
};

module.exports = pub;
