/**
 * @copyright Homit 2018
 */

let pub = {};

/**
 * Returns list of categories by store type api name
 * @param {*} storeType name for store type
 */
pub.getCategoriesByStoreType = async function (storeType) {
    if (!storeType) {
        Logger.log.error("Undefined Store type for getCategoriesByStoreType function");
        return false;
    }

    return MDB.models[storeType].find({}).distinct('category').exec();
}

/**
 * Get banners for store type
 * 
 * @param {*} storeType
 */
pub.getBannersByStoreType = async function (storeType) {
    if (!storeType) {
        Logger.log.error("Undefined Store type for getBannersByStoreType function");
        return false;
    }

    let sqlQuery = `
        SELECT 
            banners.image AS image,
            banners.category_id AS category_id,
            banners.subcategory_id AS subcategory_id,
            banners.product_id AS product_id,
            subcategory.name AS subcategory_name,
            category.name AS category_name
        FROM 
            catalog_store_types_banners AS banners
        JOIN 
            catalog_store_types AS store_types ON (store_types.id = banners.store_type_id)
        JOIN 
            catalog_categories AS category ON (category.id = banners.category_id)
        LEFT JOIN 
            catalog_subcategories AS subcategory ON (subcategory.id = banners.subcategory_id)
        WHERE 
            ?
        AND 
            active = true
    `;

    let data = {
        "store_types.name": storeType
    };

    let dbResult = await db.runQuery(sqlQuery, data);
    return getFormattedBanners(dbResult);
}

/**
 * Get all specials by store type
 * 
 * @param {*} storeType
 */
pub.getAllSpecialsByStoreType = async function (storeType) {
    if (!storeType) {
        Logger.log.error("Undefined Store type for getAllSpecialsByStoreType function");
        return false;
    }

    let sqlQuery = `
        SELECT
        special_types.display_name AS special_types_display_name,
        special_types.api_name AS special_types_api_name,
        special_products.product_id AS product_id,
        store_types.name AS store_type_name,
        products.image AS product_image,
        listings.brand AS brand,
        listings.name AS name,
        depot.price AS price
        
        FROM catalog_store_types_special_types AS special_types
        JOIN catalog_store_types_special_products AS special_products ON (special_types.id = special_products.special_type_id)
        JOIN catalog_store_types AS store_types ON (store_types.id = special_products.store_type_id)
        JOIN catalog_products AS products ON (special_products.product_id = products.id)
        JOIN catalog_listings AS listings ON (products.listing_id = listings.id)
        JOIN catalog_items AS items ON (items.product_id = products.id)
        JOIN catalog_depot AS depot ON (depot.item_id = items.id)
        
        JOIN catalog_packaging_containers AS containers ON (containers.id = products.container_id)
        JOIN catalog_packaging_packagings AS packagings ON (packagings.id = items.packaging_id)
        JOIN catalog_packaging_volumes AS volumes ON (volumes.id = items.volume_id)
        
        WHERE ?
        AND special_products.active = true
        AND depot.available = true
        ORDER by special_type_id, product_id, price;`;

    let data = {
        "store_types.name": storeType
    };

    let specials = await db.runQuery(sqlQuery, data);

    if (specials == false) {
        return false;
    } else {
        return getFormattedSpecials(specials);
    }
}

/**
 * Get all specials for hub
 * 
 */
pub.getAllMainSpecials = async function () {
    let sqlQuery = `
        SELECT
        special_types.display_name AS special_types_display_name,
        special_types.api_name AS special_types_api_name,
        special_products.product_id AS product_id,
        store_types.name AS store_type_name
        
        FROM catalog_hub_special_types AS special_types
        JOIN catalog_hub_special_products AS special_products ON (special_types.id = special_products.special_type_id)
        JOIN catalog_store_types AS store_types ON (store_types.id = special_products.store_type_id)
        
        WHERE
        special_products.active = true
        ORDER by special_type_id;`;

    let specials = await db.runQuery(sqlQuery);
    if (specials == false) {
        return false;
    } else {
        return getFormattedSpecials(specials);
    }
}

/**
 * Returns store info object
 * @param {string} storeType 
 */
pub.getStoreTypeInfo = async function (storeType) {
    let data = { "name": storeType };
    let dbResult = await db.selectAllWhereLimitOne(db.tables.catalog_store_types, data);
    return dbResult[0];
}

/**
 * Get daily store hours by store type
 * 
 * @param {*} storeType 
 * @param {*} isScheduled defaults to false
 */
pub.getStoreHours = async function (storeType, isScheduled = false) {
    let openTime = `open_time`;
    let openDuration = `open_duration`;

    if (isScheduled) {
        openTime = `open_time_scheduled`;
        openDuration = `open_duration_scheduled`;
    }

    let sqlQuery = `
        SELECT 
        hours.day AS day, MIN(hours.` + openTime + `) AS open_time, MAX(hours.` + openTime + ` + INTERVAL hours.` + openDuration + ` MINUTE) AS close_time
        FROM
        catalog_stores AS stores
        JOIN catalog_store_types AS store_types ON (stores.store_type = store_types.id)
        JOIN stores_hours AS hours ON (stores.id = hours.store_id)
        WHERE ?
        GROUP BY day
    `;

    let data = { "store_types.name": storeType }
    let dbResult = await db.runQuery(sqlQuery, data);

    let result = {};
    for (let i = 0; i < dbResult.length; i++) {
        let today = {
            open: dbResult[i].open_time,
            close: dbResult[i].close_time
        };
        if (today.close == "24:30:00") {
            today.close = "24:00:00";
        }
        result[dbResult[i].day] = today;
    }

    return result;
}

/**
 * Returns true if any of the stores related to the store type is open
 * 
 * @param {*} storeType 
 * @param {*} intereval defaults to 30
 */
pub.isStoreOpen = async function (storeType, intereval = 30) {
    let sqlQuery = `
        SELECT 
        stores.id
        FROM
        catalog_stores AS stores
        JOIN catalog_store_types AS store_types ON (stores.store_type = store_types.id)
        JOIN stores_hours AS hours ON (stores.id = hours.store_id)
        WHERE 
        ?
        AND 
        (
            (
                hours.day = DAYOFWEEK(CURRENT_TIME)
                AND CURRENT_TIME > hours.open_time
                AND CURRENT_TIME < hours.open_time + INTERVAL hours.open_duration MINUTE - INTERVAL ` + intereval + ` MINUTE
            )
        OR
            (
                hours.day = DAYOFWEEK(CURRENT_DATE - INTERVAL 1 DAY)
                AND CURRENT_TIME + INTERVAL 24 HOUR < hours.open_time + INTERVAL hours.open_duration MINUTE - INTERVAL ` + intereval + ` MINUTE
                AND CURRENT_TIME + INTERVAL 24 HOUR > hours.open_time
            )
        )
        LIMIT 1;
    `;

    let data = {
        "store_types.name": storeType
    };

    let dbResult = await db.runQuery(sqlQuery, data);
    return dbResult.length > 0;
}

/**
 * Returns true if any of the stores related to the store type is open for delivery
 * Interval will be 20 minutes
 * 
 * @param {*String} storeType
 */
pub.isStoreOpenForDelivery = async function (storeType) {
    return await pub.isStoreOpen(storeType, 20);
}

/**
 * Returns true if any of the stores related to the store type is open during the schedule time
 * 
 * @param {*} storeType 
 * @param {*} timestamp 
 */
pub.isStoreOpenForScheduled = async function (storeType, timestamp) {
    let sqlTime = HelperUtils.timestampToSqlTime(timestamp);
    let sqlDayOfWeek = HelperUtils.timestampToSqlDatOfWeek(timestamp);

    let sqlQuery = `
        SELECT 
        stores.id
        FROM
        catalog_stores AS stores
        JOIN catalog_store_types AS store_types ON (stores.store_type = store_types.id)
        JOIN stores_hours AS hours ON (stores.id = hours.store_id)
        WHERE ?
        AND 
        (
                ?
                AND TIME('`+ sqlTime + `') >= hours.open_time_scheduled + INTERVAL 60 MINUTE
                AND TIME('`+ sqlTime + `') <= hours.open_time_scheduled + INTERVAL hours.open_duration_scheduled MINUTE
        )
        LIMIT 1;
    `;

    let data1 = {
        "store_types.name": storeType
    };

    let data2 = {
        "hours.day": sqlDayOfWeek
    };

    let dbResult = await db.runQuery(sqlQuery, [data1, data2]);
    return dbResult.length > 0;
}

/**
 * Return all products based on the store type and category provided
 * 
 * @param {*} storeType 
 * @param {*} categoryName 
 */
pub.getAllProductsByCategory = async function (storeType, categoryName) {
    let result = await MDB.models[storeType].aggregate([{ $match: { "category.category_name": categoryName } },
    {
        $group: {
            _id: "$subcategory",
            products: { $push: "$$ROOT" }
        }
    }
    ]);
    return result;
}

/**
 * Return all subcategories based on the store type and category provided
 * 
 * @param {*} storeType 
 * @param {*} categoryName 
 */
pub.getAllSubcategoriesByCategory = async function (storeType, categoryName) {
    let result = await MDB.models[storeType]
        .find({ "category.category_name": categoryName })
        .distinct('subcategory');
    return result;
}

/**
 * Search for the text in store types
 * 
 * @param {*} searchText 
 * @param {*} limit
 */
pub.searchStoreType = async function (searchText, limit) {
    if (limit > 0) {
        let sqlQuery = `
        SELECT DISTINCT display_name AS store_type_display_name, image AS store_type_image, name AS store_type_name
        FROM catalog_store_types
        WHERE available = true
        AND display_name LIKE '` + searchText + `%'
        LIMIT ` + limit;
        let dbResult = await db.runQuery(sqlQuery);
        return dbResult;
    } else {
        return [];
    }
}

/**
 * Get store type id by name
 * 
 * @param {*} storeType 
 */
pub.getStoreTypeIdByName = async function (storeType) {
    let storeTypeInfo = await Catalog.getStoreTypeInfo(storeType);
    if (storeTypeInfo) {
        return storeTypeInfo.id;
    } else {
        return false;
    }
}

/**
 * Calculate prices for products
 * 
 * @param {*} products 
 * @param {*} couponDetails - optional, passed if there are coupon details
 */
pub.calculatePrice = async function (inObject, couponDetails) {
    let ALBERTA_GST = 0.05;

    let pricesPerOrder = {};
    let products = inObject ? (inObject.products || []) : [];
    let rates = inObject ? (inObject.rates || new Map()) : new Map();
    let rateToStoreMap = inObject ? (inObject.rate_to_store_map || new Map()) : new Map();
    let usedRateIds = [];

    let totalAmount = 0;
    let totalTax = 0;
    let totalDelivery = 0;
    let totalPrice = 0;
    let totalCouponOff = 0;

    let couponsUsed = [];

    for (let storeType in products) {
        let tmpAmount = 0;
        let tmpTax = 0;
        let tmpCouponOff = 0;
        let tmpDelivery = 0;
        let tmpCouponId = undefined;
        let tmpCouponMessage = undefined;

        //*product cost calculation
        for (let item in products[storeType].products) {
            tmpAmount = tmpAmount + parseFloat(products[storeType].products[item].price) * products[storeType].products[item].quantity;
            if (products[storeType].products[item].tax) {
                tmpTax = tmpTax + parseFloat(products[storeType].products[item].price) * products[storeType].products[item].quantity * ALBERTA_GST;
            }
        }

        //*delivery cost calculation 
        if (rates.has(rateToStoreMap.get(storeType)) && !usedRateIds.includes(rateToStoreMap.get(storeType))) {
            tmpDelivery = rates.get(rateToStoreMap.get(storeType)) || 0;
            usedRateIds.push(rateToStoreMap.get(storeType));
        }

        tmpTax = Math.round((tmpTax + tmpDelivery * ALBERTA_GST) * 100) / 100;
        tmpTax = parseFloat(tmpTax.toFixed(2));
        tmpAmount = parseFloat(tmpAmount.toFixed(2));
        tmpDelivery = parseFloat(tmpDelivery.toFixed(2));

        if (couponDetails) {
            let tmpCoupon = await Coupon.getCouponOff(storeType, couponDetails[storeType], tmpAmount, couponDetails.user_id);
            if (tmpCoupon.off > 0) {
                tmpCouponOff = tmpCoupon.off;
                tmpCouponId = tmpCoupon.coupon_id;
                tmpCouponMessage = tmpCoupon.message;
                couponsUsed.push(tmpCoupon);
            }
        }

        let tmpTotalPrice = tmpTax + tmpAmount + tmpDelivery - tmpCouponOff;

        if (tmpTotalPrice < 0) {
            tmpTotalPrice = 0;
        }

        tmpAmount = Math.round(tmpAmount * 100) / 100;
        tmpTax = Math.round(tmpTax * 100) / 100;
        tmpDelivery = Math.round(tmpDelivery * 100) / 100;
        tmpCouponOff = Math.round(tmpCouponOff * 100) / 100;
        tmpTotalPrice = Math.round(tmpTotalPrice * 100) / 100;

        pricesPerOrder[storeType] = {
            "cart_amount": tmpAmount,
            "delivery_fee": tmpDelivery,
            "total_tax": tmpTax,
            "total_coupon_off": tmpCouponOff,
            "total_price": tmpTotalPrice,
            "original_total_price": (tmpTotalPrice + tmpCouponOff),
            "coupon_id": tmpCouponId,
            "coupon_invoice_message": tmpCouponMessage
        };

        totalAmount += tmpAmount;
        totalTax += tmpTax;
        totalDelivery += tmpDelivery;
        totalPrice += tmpTotalPrice;
        totalCouponOff += tmpCouponOff;
    }

    let generalCouponOff = 0;
    let generalCoponId = undefined;
    let generalCoponMessage = undefined;

    if (couponDetails && couponDetails[Coupon.GENERAL_COUPON_TYPE]) {
        let generalCoupon = await Coupon.getCouponOff(Coupon.GENERAL_COUPON_TYPE, couponDetails.general, totalAmount, couponDetails.user_id);
        if (generalCoupon.off > 0) {
            generalCoponId = generalCoupon.coupon_id;
            generalCouponOff = generalCoupon.off;
            generalCoponMessage = generalCoupon.message;
            couponsUsed.push(generalCoupon);
        }
    }

    totalPrice = totalPrice - generalCouponOff;

    if (totalPrice < 0) {
        totalPrice = 0;
    }

    totalCouponOff += generalCouponOff;

    totalAmount = Math.round(totalAmount * 100) / 100;
    totalTax = Math.round(totalTax * 100) / 100;
    totalDelivery = Math.round(totalDelivery * 100) / 100;
    totalPrice = Math.round(totalPrice * 100) / 100;
    totalCouponOff = Math.round(totalCouponOff * 100) / 100;

    let finalPrices = {
        "cart_amount": totalAmount,
        "delivery_fee": totalDelivery,
        "total_tax": totalTax,
        "total_price": totalPrice,
        "total_coupon_off": totalCouponOff,
        "original_total_price": (totalPrice + totalCouponOff),
        "general_coupon_id": generalCoponId,
        "general_coupon_off": generalCouponOff,
        "general_coupon_invoice_message": generalCoponMessage,
        "order_prices": pricesPerOrder,
        "coupons_used": couponsUsed
    };

    return finalPrices;
}

/**
 * Get cart products by UIDs for calculator to process
 *  
 * @param {*} cartProducts {UID : quantity}
 */
pub.prepareProductsForCalculator = async function (cartProducts) {
    let ratesMap = new Map();
    let storesMap = new Map();
    let finalResult = [];
    let UIDs = Object.keys(cartProducts);

    if (!(UIDs.length === 0 && cartProducts.constructor === Object)) {
        for (let id in UIDs) {
            let selectedQuantity = cartProducts[UIDs[id]];
            let IDobject = MDB.formatReceviedUID(UIDs[id]);
            let rawStore = await db.selectAllWhereLimitOne(db.tables.catalog_store_types, { "id": IDobject.storeId });
            if (rawStore && rawStore.length > 0) {
                let selectedStore = rawStore[0];
                let searchId = IDobject.storeId + '-' + IDobject.productId;
                let storeName = selectedStore.name;
                let rateId = selectedStore.rate_id;
                let result = await MDB.models[storeName].findById(searchId).exec();
                let tax = result.tax;
                let product = pub.findNestedProductPrice(result.toObject(), [searchId, IDobject.varianceId, IDobject.packId]);
                if (product) {

                    if (!finalResult.hasOwnProperty(storeName)) {
                        finalResult[storeName] = {
                            products: [],
                            del_fee_primary: String,
                            del_fee_secondary: String,
                            rateId: Number
                        };
                    }

                    finalResult[storeName].products.push({
                        "UID": UIDs[id],
                        "tax": tax,
                        "price": product.price,
                        "quantity": selectedQuantity
                    });

                    if (!ratesMap.has(rateId) || selectedStore.del_fee_primary < ratesMap.get(rateId)) {
                        ratesMap.set(rateId, selectedStore.del_fee_primary);
                        storesMap.set(storeName, rateId);
                    }
                }
            }
        }
    }

    return {
        rates: ratesMap,
        rate_to_store_map: storesMap,
        products: finalResult
    };
}

/**
 * Finds nested product object including size
 * 
 * @param {Object} product  document from Mongo DB
 * @param {array} searchId [product, variance and pack ids] e.g. 9-3-1 and 9-3-1-1
 */
pub.findNestedProductPrice = function (product, ids) {
    if (product && ids && product.variance && product.tax) {
        let selectedvariances = product.variance;
        for (let k in selectedvariances) {
            let variance = selectedvariances[k];
            let searchId = ids[0] + '-' + ids[1];
            if (variance._id == searchId && variance.packs) {
                let packs = variance.packs;
                let localSize = variance.preffered_unit_size + variance.preffered_unit;
                for (let l in packs) {
                    let pack = packs[l];
                    searchId += '-' + ids[2];
                    if (pack._id == searchId && pack.price) {
                        pack.size = localSize;
                        return pack;
                    }
                }
            }
        }
    }
    return false;
}

pub.getProductPageItemsByProductId = async function (storeType, productId) {
    let storeObject = {};
    let finalResult = {};
    let storeTypeInfo = await Catalog.getStoreTypeInfo(storeType);

    if (storeTypeInfo) {
        let searchId = storeTypeInfo.id + '-' + productId;
        let product = await MDB.models[storeType].findById(searchId).exec();

        if (product) {
            storeObject.store_open = await pub.isStoreOpen(storeType)
            storeObject.store_type_name = storeType;
            storeObject.store_type_display_name = storeTypeInfo.display_name;

            Object.assign(finalResult, product.toObject(), storeObject);

            return finalResult;
        }
    }

    return false;
}

/**
 * Check if store open for the products in checkout
 * 
 * @param {*} depotIds 
 */
pub.checkProductsForStoreOpen = async function (depotIds) {
    let dbProducts;
    if (depotIds.length > 0) {
        let sqlQuery = `
            SELECT depot.id AS depot_id,
            store_type.name AS store_type
            FROM catalog_depot AS depot JOIN catalog_store_types AS store_type ON(depot.store_type_id = store_type.id)
            WHERE depot.id in (` + depotIds + `)
            ORDER BY store_type`;

        dbProducts = await db.runQuery(sqlQuery);
    } else {
        dbProducts = [];
    }

    let products = {};
    let currentStoreType = {};
    let storeOpen;
    let allStoresOpen = true;
    for (let i = 0; i < dbProducts.length; i++) {
        if (i == 0) {
            storeOpen = await pub.isStoreOpen(dbProducts[i].store_type);
            if (allStoresOpen && !storeOpen) {
                allStoresOpen = false;
            }
            currentStoreType[dbProducts[i].depot_id] = storeOpen;
        } else {
            if (dbProducts[i - 1].store_type != dbProducts[i].store_type) {
                products[dbProducts[i - 1].store_type] = currentStoreType;
                currentStoreType = {};
                storeOpen = await pub.isStoreOpen(dbProducts[i].store_type);
                if (allStoresOpen && !storeOpen) {
                    allStoresOpen = false;
                }
            }
            currentStoreType[dbProducts[i].depot_id] = storeOpen;
        }

        if (i == dbProducts.length - 1) {
            products[dbProducts[i].store_type] = currentStoreType;
        }
    }

    let finalResult = {
        all_stores_open: allStoresOpen,
        products: products
    };

    return finalResult;
}

/**
 * Returns suggested products based on product id
 * 
 * @param {*} productId 
 */
pub.getSimilarProducts = async function (limit, productId) {
    let result = [];

    if (productId) {
        result = await getItemsBoughtTogether(productId);
    }

    if (limit > 0 || result.length == 0) {
        result = result.concat(await getRandomArrayOfProducts(limit));
    }

    return result;
}

/**
 * Returns true if storeType exists and category 
 * belongs to given store type
 * @param {*} storeType store type name (e.g. liquor-station)
 * @param {*} receivedCategory  category from that store (e.g. beer)
 */
pub.verifyStoreCategory = async function (storeType, receivedCategory) {
    if (!(storeType && receivedCategory)) {
        Logger.log.error("Undefined Store type for getCategoriesByStoreType function");
        return false;
    }

    let result = await MDB.models[storeType].find({ 'category.category_name': receivedCategory }).exec();

    return (!result.error && result.length > 0);
}

/**
 * Get all store types without unions and unions
 */
pub.getAllStoreTypesAndUnions = async function () {
    let data = { "available": true };
    let sqlQuery = `
    SELECT 
	*
    FROM 
        catalog_store_types
    WHERE 
        ?
    AND 
        union_id IS NULL;`;
    let resultWithNoUnions = await db.runQuery(sqlQuery, data);
    let unions = await db.selectAllFromTable(db.tables.catalog_store_unions);
    let result = resultWithNoUnions.concat(unions);
    return result;
}

/**
 * Get all store type names regardless of unions
 */
pub.getAllStoreTypeNames = async function () {
    let data = { "available": true };
    let sqlQuery = `
    SELECT 
        catalog_store_types.name as name
    FROM 
        catalog_store_types
    WHERE 
        ?`;
    let result = await db.runQuery(sqlQuery, data);
    return result;
}

/**
 * Returns object with union display name 
 * if storeType is actually a union
 * Returns false otherwise
 * @param {*} parent 
 */
pub.isParentUnion = async function (parent) {
    if (parent) {
        let data = { "name": parent };
        let result = await db.selectAllWhereLimitOne(db.tables.catalog_store_unions, data);
        if (result.length == 0) {
            return false;
        }
        return result[0];
    }
    return false;
}

/**
 * Returns array of stores in the given union  
 * @param {*} unionName 
 */
pub.getUnionStores = async function (unionName) {
    if (unionName) {
        let data = { "catalog_store_unions.name": unionName };
        let sqlQuery = `
        SELECT 
        catalog_store_types.del_fee_primary, catalog_store_types.del_fee_secondary, catalog_store_types.display_name, catalog_store_types.name, catalog_store_types.image 
        FROM 
        catalog_store_types
        JOIN 
        catalog_store_unions
        ON 
        catalog_store_types.union_id=catalog_store_unions.id
        WHERE 
        ?;`;
        let result = await db.runQuery(sqlQuery, data);

        if (result.length == 0) {
            return false;
        }
        return result;
    }
    return false;
}

async function getItemsBoughtTogether(productId) {
    let finalResult = [];
    let newRegEx = new RegExp("([0-9]-)");
    let orderIds = await db.selectAllWhere(db.tables.orders_cart_items, { "depot_id": productId });

    if (orderIds && orderIds.length > 0) {
        let data = [];

        for (order in orderIds) {
            data.push(orderIds[order].order_id);
        }

        let products = await db.runQuery(`
        SELECT DISTINCT
            depot_id as id, catalog_store_types.name as name
        FROM
            orders_cart_items
        JOIN 
            orders_history 
        ON
            orders_history.id = orders_cart_items.order_id
        JOIN
            catalog_store_types
        ON 
            catalog_store_types.id = orders_history.store_type
        WHERE
            depot_id <> ${productId} 
        AND
            catalog_store_types.available = TRUE
        AND 
        order_id IN (${data.toString()});`);

        if (products) {
            for (let k in products) {
                if (newRegEx.test(products[k].id)) {
                    finalResult.push(await MDB.models[products[k].name].findById(products[k].id).exec());
                }
            }
        }
    }

    return finalResult;
}

/**
 * Creater random array of products from random stores,
 * categories and products
 */
async function getRandomArrayOfProducts(limit) {
    let productsArray = [];
    let knownNumbers = [];
    let chosenProductIds = [];
    let counter = 0, safetyBreak = 0;
    let availableStoreTypes = await db.selectAllWhere(db.tables.catalog_store_types, { available: true });

    if (availableStoreTypes && availableStoreTypes.length > 0) {
        while (counter < limit && safetyBreak < 100) {
            let randomNumber = getRandomNmber(availableStoreTypes.length - 1, knownNumbers);
            knownNumbers.push(randomNumber);
            let selectedStore = availableStoreTypes[randomNumber];
            let product = await MDB.models[selectedStore.name].aggregate([{ $sample: { size: 1 } }]).exec();
            if (product.length > 0 && !chosenProductIds.includes(product[0]._id) && product) {
                productsArray.push(product[0]);
                chosenProductIds.push(product[0]._id);
                counter++;
            }
            safetyBreak++;
        }
    }

    return productsArray;
}

async function getFormattedBanners(banners) {
    let result = [];

    for (let i = 0; i < banners.length; i++) {
        let tmpProductId = banners[i].product_id;
        delete banners[i].product_id;
        if (tmpProductId == null) {
            banners[i].product = undefined;
        } else {
            let tmpProduct = await getProductInfoById(tmpProductId);
            if (!tmpProduct) {
                banners[i].product = undefined;
            } else {
                banners[i].product = {
                    product_id: tmpProductId,
                    brand: tmpProduct.brand,
                    name: tmpProduct.name
                };
            }
        }
        result.push(banners[i]);
    }

    return result;
}

async function getProductInfoById(productId) {
    let sqlQuery = `
        SELECT *
        FROM catalog_listings AS listing JOIN catalog_products AS product ON (listing.id = product.listing_id)
        WHERE ?;`;

    let data = { "product.id": productId };

    let tmpResult = await db.runQuery(sqlQuery, data);

    if (tmpResult.length > 0) {
        return tmpResult[0];
    } else {
        return false;
    }
}

/**
 * Format specials
 * 
 * @param {*} specials 
 */
async function getFormattedSpecials(specials) {
    let result = {};
    let tmpSpecialType = "";
    let tmpSpecialTypeDisplay = "";

    for (let x = 0; x < specials.length; x++) {
        let mongoProduct = await MDB.models[specials[x]["store_type_name"]].findById(specials[x]["product_id"]).exec();
        let product = mongoProduct.toObject();

        tmpSpecialType = specials[x].special_types_api_name;
        tmpSpecialTypeDisplay = specials[x].special_types_display_name;

        if (!result.hasOwnProperty(tmpSpecialType)) {
            result[tmpSpecialType] = {
                "display_name": tmpSpecialTypeDisplay,
                "api_name": tmpSpecialType,
                "products": []
            };
        }
        product["store_name"] = specials[x]["store_type_name"];
        result[tmpSpecialType].products.push(product);
    }
    return result;
}

/**
 * Returns random number between 0 and limit (including)
 * 
 * @param {*} limit
 * @param {*} exclusionArray numbers to avaoid
 */
function getRandomNmber(limit, exclusionArray) {
    let i = 0;
    while (i < 100 || exclusionArray - 1 == limit) {
        let generated = Math.floor(Math.random() * (limit + 1));
        if (exclusionArray.length == 0 || !exclusionArray.includes(generated)) {
            return generated;
        }
        i++;
    }

    return Math.floor(Math.random() * (limit + 1));
}

module.exports = pub;
