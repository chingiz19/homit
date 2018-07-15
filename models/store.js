/**
 * @copyright Homit 2018
 */

var pub = {};

/**
 * Authenticate store by username and password
 * 
 * @param {*} userName 
 * @param {*} password 
 */
pub.authenticate = async function (userName, password) {
    var data = { user_name: userName };
    var store = await db.selectAllWhereLimitOne(db.tables.stores_authentication, data);
    if (store.length > 0) {
        var match = await Auth.comparePassword(password, store[0].password);
        if (match) {
            return (store[0].store_id);
        }
    }
    return false;
}

/**
 * Get store info
 * 
 * @param {*} storeId 
 */
pub.getStoreInfo = async function (storeId) {
    var sqlQuery = `
        SELECT
        store.id AS store_id, store.id_prefix AS store_id_prefix, store.name AS store_name,
        store.address AS store_address, store.address_latitude AS store_address_latitude,
        store.address_longitude AS store_address_longitude, store.phone_number AS store_phone_number,
        store_type.name AS store_type_name, store_type.display_name AS store_type_display_name,
        store_type.image AS store_type_image

        FROM
        catalog_stores AS store JOIN catalog_store_types AS store_type ON (store.store_type = store_type.id)
        WHERE ?`;

    var data = { "store.id": storeId };
    var storeInfo = await db.runQuery(sqlQuery, data);
    return storeInfo[0];
}

/**
 * Makes new order JSON and sends it to Store app via Network Manager
 * @param {*} storeId Received from Chikimiki
 */
pub.newOrder = function (storeId) {
    var json = {
        "take_action": true,
        "details": "new_order"
    }
    NM.sendToStores(storeId, json);
}

/**
 * Makes new order JSON and sends it to Store app via Network Manager
 * @param {*} storeId Received from Chikimiki
 */
pub.driverAction = function (storeId) {
    let json = {
        "take_action": true,
        "details": "driver_action"
    }
    NM.sendToStores(storeId, json);
}

/**
 * Makes 'logout' JSON and sends it to Store app via Network Manager
 * @param {*} storeId id of store
 */
pub.logoutStoreApp = function (storeId) {
    var json = {
        "take_action": true,
        "details": "logout"
    }
    NM.sendToStores(storeId, json);
}

module.exports = pub;
