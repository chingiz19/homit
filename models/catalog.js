/**
 * @copyright Homit 2018
 */

var pub = {};

/**
* Returns list of categories by store type api name
* 
* @param {*} storeType name for store type
*/
pub.getCategoriesByStoreType = async function (storeType) {
    if (!storeType) {
        Logger.log.error("Undefined Store type for getCategoriesByStoreType function");
        return false;
    }

    let sqlQuery = `
        SELECT DISTINCT
        category.display_name AS category_display_name, category.name AS category_name,
        category.image AS category_image
        FROM
        catalog_store_types AS store_types
        JOIN catalog_depot AS depot ON (store_types.id = depot.store_type_id)
        JOIN catalog_items AS item ON (depot.item_id = item.id)
        JOIN catalog_products AS product ON (item.product_id = product.id)
        JOIN catalog_listings AS listing ON (product.listing_id = listing.id)
        JOIN catalog_types AS type ON (listing.type_id = type.id)
        JOIN catalog_subcategories AS subcat ON (type.subcategory_id = subcat.id)
        JOIN catalog_categories AS category ON (subcat.category_id = category.id)
        WHERE ?
        ORDER BY category_display_name;
    `;

    let data = {
        "store_types.name": storeType
    };

    return await db.runQuery(sqlQuery, data);
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

var getFormattedBanners = async function (banners) {
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

var getProductInfoById = async function (productId) {
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
        store_types.name AS store_type_name,
        category.name AS category,
        products.image AS product_image,
        listings.brand AS brand,
        listings.name AS name,
        depot.price AS price,
        containers.name AS container,
        packagings.name AS packaging,
        volumes.name AS volume
        
        FROM catalog_hub_special_types AS special_types
        JOIN catalog_hub_special_products AS special_products ON (special_types.id = special_products.special_type_id)
        JOIN catalog_store_types AS store_types ON (store_types.id = special_products.store_type_id)
        JOIN catalog_products AS products ON (special_products.product_id = products.id)
        JOIN catalog_listings AS listings ON (products.listing_id = listings.id)
        JOIN catalog_types AS type ON (listings.type_id = type.id)
        JOIN catalog_subcategories AS subcategory ON (type.subcategory_id = subcategory.id)
        JOIN catalog_categories AS category ON (subcategory.category_id = category.id)
        JOIN catalog_items AS items ON (items.product_id = products.id)
        JOIN catalog_depot AS depot ON (depot.item_id = items.id)
        
        JOIN catalog_packaging_containers AS containers ON (containers.id = products.container_id)
        JOIN catalog_packaging_packagings AS packagings ON (packagings.id = items.packaging_id)
        JOIN catalog_packaging_volumes AS volumes ON (volumes.id = items.volume_id)
        
        WHERE
        special_products.active = true
        AND depot.available = true
        ORDER by special_type_id, product_id, price;`;

    let specials = await db.runQuery(sqlQuery);
    if (specials == false) {
        return false;
    } else {
        return getFormattedSpecials(specials);
    }
}

/**
 * Format specials
 * 
 * @param {*} specials 
 */
var getFormattedSpecials = function (specials) {
    let result = {};

    let tmpProducts = {};
    let tmpSpecialType;
    let tmpSpecialTypeDisplay;
    for (let i = 0; i < specials.length; i++) {
        if (i == 0) {
            tmpSpecialType = specials[i].special_types_api_name;
            tmpSpecialTypeDisplay = specials[i].special_types_display_name;
        }

        let currentProduct = Object.assign({}, specials[i]);
        delete currentProduct.special_types_display_name;
        delete currentProduct.special_types_api_name;

        if (tmpSpecialType != specials[i].special_types_api_name) {
            result[tmpSpecialType] = {
                "display_name": tmpSpecialTypeDisplay,
                "api_name": tmpSpecialType,
                "products": Object.values(tmpProducts)
            };

            tmpProducts = {};
            tmpSpecialType = specials[i].special_types_api_name;
            tmpSpecialTypeDisplay = specials[i].special_types_display_name;
        }

        if (!tmpProducts[currentProduct.product_id]) {
            tmpProducts[currentProduct.product_id] = currentProduct;
        }

        if (i == specials.length - 1) {
            result[tmpSpecialType] = {
                "display_name": tmpSpecialTypeDisplay,
                "api_name": tmpSpecialType,
                "products": Object.values(tmpProducts)
            };
        }
    }

    return result;
}

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
    let sqlQuery = `
        SELECT
        depot.id AS depot_id,
        item.id AS item_id,
        listing.id AS listing_id,
        product.id AS product_id,
        type.name AS type,
        subcategory.name AS subcategory,
        category.name AS category,
        store_type.name AS store_type_name,
        store_type.display_name AS store_type_display_name,
        listing.id AS listing_id,
        listing.brand AS brand,
        listing.name AS name,
        product.image AS image,
        depot.price AS price,
        depot.tax AS tax,
        packaging.name AS packaging,
        container.name AS container,
        volume.name AS volume
        
        FROM
        catalog_depot AS depot JOIN catalog_items AS item ON (depot.item_id = item.id)
        JOIN catalog_products AS product ON (item.product_id = product.id)
        JOIN catalog_listings AS listing ON (product.listing_id = listing.id)
        JOIN catalog_types AS type ON (listing.type_id = type.id)
        JOIN catalog_subcategories AS subcategory ON (type.subcategory_id = subcategory.id)
        JOIN catalog_categories AS category ON (subcategory.category_id = category.id)
        JOIN catalog_store_types AS store_type ON (depot.store_type_id = store_type.id)
        JOIN catalog_packaging_containers AS container ON (product.container_id = container.id)
        JOIN catalog_packaging_volumes AS volume ON (item.volume_id = volume.id)
        JOIN catalog_packaging_packagings AS packaging ON (item.packaging_id = packaging.id)
        
        WHERE depot.available = true
        AND ? AND ?
        
        ORDER BY subcategory, listing_id, product_id, price`;

    let data = [{ "category.name": categoryName }, { "store_type.name": storeType }];
    let dbResult = await db.runQuery(sqlQuery, data);
    return getFormattedProducts(dbResult);
}

/**
 * Format products for front-end
 * 
 * @param {*} items 
 */
var getFormattedProducts = function (items) {
    let products = {};

    let tmpProducts = {};
    let tmpSubcategory;
    for (let i = 0; i < items.length; i++) {
        if (i == 0) {
            tmpSubcategory = items[i].subcategory;
        }

        let currentItem = Object.assign({}, items[i]);

        if (tmpSubcategory != items[i].subcategory) {
            products[tmpSubcategory] = {
                "subcategory": tmpSubcategory,
                "products": Object.values(tmpProducts)
            };

            tmpProducts = {};
            tmpSubcategory = items[i].subcategory;
        }

        if (!tmpProducts[currentItem.product_id]) {
            let imageLocation = "/resources/images/products/" + currentItem.category.toLowerCase() + "/";
            currentItem.image = imageLocation + currentItem.image;
            tmpProducts[currentItem.product_id] = currentItem;
        }

        if (i == items.length - 1) {
            products[tmpSubcategory] = {
                "subcategory": tmpSubcategory,
                "products": Object.values(tmpProducts)
            };
        }
    }

    let subcategories = Object.keys(products);

    let result = {
        subcategories: subcategories,
        products: products
    };

    return result;
}

/* Format products for front-end - for product page
* 
* @param {*} products 
*/
var getFormattedProductsForProductPage = function (products) {
    let tmpResult = {};

    for (let i = 0; i < products.length; i++) {
        let product = products[i];
        let p_package = product.packaging;
        let p_volume = product.volume;

        let imageLocation = "/resources/images/products/" + product.category.toLowerCase() + "/";

        if (tmpResult.hasOwnProperty(product.product_id)) {
            // Adding to product variant
            if (tmpResult[product.product_id].product_variants.hasOwnProperty(p_volume)) {
                tmpResult[product.product_id].product_variants[p_volume][p_package] = {
                    "depot_id": product.depot_id,
                    "price": product.price
                }
            } else {
                tmpResult[product.product_id].product_variants[p_volume] = {
                    all_packagings: []
                };
                tmpResult[product.product_id].product_variants[p_volume][p_package] = {
                    "depot_id": product.depot_id,
                    "price": product.price
                }
            }
        } else {
            // Adding to tmpResult
            tmpResult[product.product_id] = {
                product_id: products[i].product_id,
                listing_id: products[i].listing_id,
                subcategory: products[i].subcategory,
                type: products[i].type,
                brand: products[i].brand,
                name: products[i].name,
                store_type: product.store_type,
                store_type_display_name: product.store_type_display_name,
                image: imageLocation + products[i].image,
                quantity: products[i].quantity,
                container: products[i].container,
                category: products[i].category,
                tax: products[i].tax,
                product_variants: {
                    all_volumes: []
                }
            };
            tmpResult[product.product_id].product_variants[p_volume] = {
                all_packagings: []
            };
            tmpResult[product.product_id].product_variants[p_volume][p_package] = {
                "depot_id": product.depot_id,
                "item_id": products[i].item_id,
                "price": product.price
            }
        }

        if (!tmpResult[product.product_id].product_variants.all_volumes.includes(p_volume))
            tmpResult[product.product_id].product_variants.all_volumes.push(p_volume);
        if (!tmpResult[product.product_id].product_variants[p_volume].all_packagings.includes(p_package))
            tmpResult[product.product_id].product_variants[p_volume].all_packagings.push(p_package);
    }

    return Object.values(tmpResult);
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
 * Search text among categories
 * 
 * @param {*} searchText 
 * @param {*} limit
 */
pub.searchCategory = async function (searchText, limit) {
    if (limit > 0) {
        let sqlQuery = `
        SELECT DISTINCT
        category.name AS category,
        category.display_name AS category_display_name,
        store_type.display_name AS store_type_display_name,
        store_type.name AS store_type_name,
        store_type.image AS store_type_image
        
        FROM
        catalog_depot AS depot JOIN catalog_items AS item ON (depot.item_id = item.id)
        JOIN catalog_products AS product ON (item.product_id = product.id)
        JOIN catalog_listings AS listing ON (product.listing_id = listing.id)
        JOIN catalog_types AS type ON (listing.type_id = type.id)
        JOIN catalog_subcategories AS subcategory ON (type.subcategory_id = subcategory.id)
        JOIN catalog_categories AS category ON (subcategory.category_id = category.id)
        JOIN catalog_store_types AS store_type ON (depot.store_type_id = store_type.id)
        
        WHERE store_type.available = true
        AND category.name LIKE '` + searchText + `%'   OR category.display_name LIKE '%` + searchText + `%'
        LIMIT ` + limit;

        let dbResult = await db.runQuery(sqlQuery);
        return dbResult;
    } else {
        return [];
    }
}

/**
 * Search for the text in subcategories
 * 
 * @param {*} searchText 
 * @param {*} limit
 */
pub.searchSubcategory = async function (searchText, limit) {
    if (limit > 0) {
        let sqlQuery = `
        SELECT DISTINCT
        category.name AS category,
        category.display_name AS category_display_name,
        store_type.display_name AS store_type_display_name,
        store_type.name AS store_type_name,
        store_type.image AS store_type_image,
        subcategory.name AS subcategory
        
        FROM
        catalog_depot AS depot JOIN catalog_items AS item ON (depot.item_id = item.id)
        JOIN catalog_products AS product ON (item.product_id = product.id)
        JOIN catalog_listings AS listing ON (product.listing_id = listing.id)
        JOIN catalog_types AS type ON (listing.type_id = type.id)
        JOIN catalog_subcategories AS subcategory ON (type.subcategory_id = subcategory.id)
        JOIN catalog_categories AS category ON (subcategory.category_id = category.id)
        JOIN catalog_store_types AS store_type ON (depot.store_type_id = store_type.id)
        
        WHERE store_type.available = true
        AND subcategory.name LIKE '` + searchText + `%'
        LIMIT ` + limit;

        let dbResult = await db.runQuery(sqlQuery);
        return dbResult;
    } else {
        return [];
    }
}

var searchProductsBase = async function (limit, sqlWhereExtra, sqlSelectExtra, sqlFromExtra) {
    let sqlSelect = `
        listing.id AS listing_id,
        product.id AS product_id,
        type.name AS type,
        subcategory.name AS subcategory,
        category.name AS category,
        store_type.display_name AS store_type_display_name,
        store_type.name AS store_type_name,
        listing.brand AS brand,
        listing.name AS name,
        product.image AS image,
        container.name AS container`;

    let sqlFrom = `
        FROM
        catalog_depot AS depot JOIN catalog_items AS item ON (depot.item_id = item.id)
        JOIN catalog_products AS product ON (item.product_id = product.id)
        JOIN catalog_listings AS listing ON (product.listing_id = listing.id)
        JOIN catalog_types AS type ON (listing.type_id = type.id)
        JOIN catalog_subcategories AS subcategory ON (type.subcategory_id = subcategory.id)
        JOIN catalog_categories AS category ON (subcategory.category_id = category.id)
        JOIN catalog_store_types AS store_type ON (depot.store_type_id = store_type.id)
        JOIN catalog_packaging_containers AS container ON (product.container_id = container.id)`;

    let sqlWhere = `
        WHERE store_type.available = true AND depot.available = true`;

    if (!sqlWhereExtra) {
        sqlWhereExtra = ` `;
    }

    if (!sqlFromExtra) {
        sqlFromExtra = ` `;
    }

    if (!sqlSelectExtra) {
        sqlSelectExtra = ` `;
    }

    let sqlQuery = `
        SELECT DISTINCT ` + sqlSelect + ` ` + sqlSelectExtra
        + ` ` + sqlFrom + ` ` + sqlFromExtra
        + ` ` + sqlWhere + ` ` + sqlWhereExtra
        + ` LIMIT ` + limit + ` ;`;

    let dbResult = await db.runQuery(sqlQuery);
    return dbResult;
}

/**
 * Search for the beginning text in brand, name
 * 
 * @param {*} searchText 
 * @param {*} limit
 */
pub.searchProductsStart = async function (searchText, limit) {
    if (limit > 0) {
        let sqlWhereExtra =
            `AND (listing.brand LIKE '` + searchText + `%' OR listing.name LIKE '` + searchText + `%'
            OR CONCAT(listing.brand,  ' ', listing.name) LIKE '` + searchText + `%')`;

        let result = await searchProductsBase(limit, sqlWhereExtra);
        return result;
    } else {
        return [];
    }
}

/**
 * Search for the end text in brand, name
 * 
 * @param {*} searchText 
 * @param {*} limit
 */
pub.searchProductsEnd = async function (searchText, limit) {
    if (limit > 0) {
        let sqlWhereExtra =
            `AND (listing.brand LIKE '%` + searchText + `%' OR listing.name LIKE '%` + searchText + `%'
            OR CONCAT(listing.brand,  ' ', listing.name) LIKE '%` + searchText + `%')
            AND (listing.brand NOT LIKE '` + searchText + `%' AND listing.name NOT LIKE '` + searchText + `%'
            AND CONCAT(listing.brand,  ' ', listing.name) NOT LIKE '` + searchText + `%')`;

        let result = await searchProductsBase(limit, sqlWhereExtra);
        return result;
    } else {
        return [];
    }
}

/**
 * Search for the text in types
 * 
 * @param {*} searchText 
 * @param {*} limit 
 */
pub.searchProductsTypes = async function (searchText, limit) {
    if (limit > 0) {
        let sqlWhereExtra = `
            AND listing.brand NOT LIKE '%` + searchText + `%' AND listing.name NOT LIKE '%` + searchText + `%'
            AND CONCAT(listing.brand,  ' ', listing.name) NOT LIKE '%` + searchText + `%'

            AND type.name LIKE '` + searchText + `%'`;

        let result = await searchProductsBase(limit, sqlWhereExtra);
        return result;
    } else {
        return [];
    }
}

/**
 * Search for the text in description
 * 
 * @param {*} searchText 
 * @param {*} limit
 */
pub.searchProductsWithDescription = async function (searchText, limit) {
    if (limit > 0) {
        let sqlSelectExtra = `
            , description_names.name AS description_key,            
            description_names.display_name AS description_key_display_name,            
            description.description AS description`;

        let sqlFromExtra = `
            JOIN catalog_listings_descriptions AS description ON (listing.id = description.listing_id)
            JOIN catalog_description_names AS description_names ON (description_names.id = description.description_key)`;

        let sqlWhereExtra = `
            AND listing.brand NOT LIKE '%` + searchText + `%' AND listing.name NOT LIKE '%` + searchText + `%'
            AND CONCAT(listing.brand,  ' ', listing.name) NOT LIKE '%` + searchText + `%'
            AND type.name NOT LIKE '` + searchText + `%'

            AND description.description LIKE '` + searchText + `%'`

        let result = await searchProductsBase(limit, sqlWhereExtra, sqlSelectExtra, sqlFromExtra);
        return result;
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
pub.calculatePrice = async function (products, couponDetails) {
    let ALBERTA_GST = 0.05;

    let pricesPerOrder = {};

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
        let tmpCouponId = undefined;
        let tmpCouponMessage = undefined;

        for (let item in products[storeType].products) {
            tmpAmount = tmpAmount + parseFloat(products[storeType].products[item].price) * products[storeType].products[item].quantity;
            if (products[storeType].products[item].tax) {
                tmpTax = tmpTax + parseFloat(products[storeType].products[item].price) * products[storeType].products[item].quantity * ALBERTA_GST;
            }
        }
        let tmpDelivery = products[storeType].del_fee_primary + Math.floor(parseInt(tmpAmount / 100)) * products[storeType].del_fee_secondary;
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
 * Get cart products by depot ids
 * 
 * @param {*} cartProducts 
 */
pub.getCartProducts = async function (cartProducts) {
    if (!(Object.keys(cartProducts).length === 0 && cartProducts.constructor === Object)) {
        let depotIds = Object.keys(cartProducts);

        let sqlQuery = `
            SELECT depot.id             AS depot_id,
            depot.price                 AS price, 
            depot.tax                   AS tax,
            store_type.name             AS store_type,
            store_type.del_fee_primary,
            store_type.del_fee_secondary
            FROM catalog_depot AS depot JOIN catalog_store_types AS store_type ON(depot.store_type_id = store_type.id)
            WHERE depot.id in (` + depotIds + `)
            ORDER BY store_type`;

        let dbResult = await db.runQuery(sqlQuery);
        return dbResult;
    }
    return [];
}

/**
 * Get cart products with respective store type
 * 
 * @param {*} dbProducts
 * @param {*} cartProducts
 */
pub.getCartProductsWithStoreType = function (dbProducts, cartProducts) {
    let products = {};
    let currentStoreType = {
        products: {}
    };
    for (let i = 0; i < dbProducts.length; i++) {
        let tmpQuantity;
        if (cartProducts) {
            tmpQuantity = cartProducts[dbProducts[i].depot_id];
        } else {
            tmpQuantity = dbProducts[i].quantity;
        }
        let currentItem = {
            depot_id: dbProducts[i].depot_id,
            price: dbProducts[i].price,
            tax: dbProducts[i].tax,
            quantity: tmpQuantity
        };


        if (i == 0) {
            currentStoreType.products[dbProducts[i].depot_id] = currentItem;
        } else {
            if (dbProducts[i - 1].store_type != dbProducts[i].store_type) {
                products[dbProducts[i - 1].store_type] = currentStoreType;
                currentStoreType = {
                    products: {}
                };
            }
            currentStoreType.products[dbProducts[i].depot_id] = currentItem;
        }
        currentStoreType.del_fee_primary = dbProducts[i].del_fee_primary;
        currentStoreType.del_fee_secondary = dbProducts[i].del_fee_secondary;

        if (i == dbProducts.length - 1) {
            products[dbProducts[i].store_type] = currentStoreType;
        }
    }

    return products;
}

/**
 * Get all descriptions for the product id
 * 
 * @param {*} productId 
 */
var getDescriptionsByProductId = async function (productId) {
    let sqlQuery = `
        SELECT name.name AS name, description.description AS description
        FROM catalog_listings AS listing
        JOIN catalog_products AS product ON (product.listing_id = listing.id)
        JOIN catalog_listings_descriptions AS description ON (listing.id = description.listing_id)
        JOIN catalog_description_names AS name ON (description.description_key = name.id)
        WHERE ?`;

    let data = { "product.id": productId };
    let dbResult = await db.runQuery(sqlQuery, data);
    return dbResult;
}

var getImagesByProductId = async function (productId) {
    let sqlQuery = `
        SELECT name.name AS name, image.image AS image, image.product_id AS product_id
        FROM catalog_image_names AS name
        JOIN catalog_products_images AS image ON (name.id = image.image_key)
        WHERE ?`;

    let data = { "image.product_id": productId };
    return await db.runQuery(sqlQuery, data);
}

/**
 * Get products by product id and store type
 * 
 * @param {*} storeType
 * @param {*} productId 
 */
var getItemsByProductId = async function (storeType, productId) {
    let sqlQuery = `
        SELECT
        depot.id AS depot_id,
        item.id AS item_id,
        listing.id AS listing_id,
        product.id AS product_id,
        type.name AS type,
        subcategory.name AS subcategory,
        category.name AS category,
        store_type.name AS store_type,
        store_type.display_name AS store_type_display_name,
        listing.brand AS brand,
        listing.name AS name,
        product.image AS image,
        depot.price AS price,
        depot.tax AS tax,
        packaging.name AS packaging,
        container.name AS container,
        volume.name AS volume
        
        FROM
        catalog_depot AS depot JOIN catalog_items AS item ON (depot.item_id = item.id)
        JOIN catalog_products AS product ON (item.product_id = product.id)
        JOIN catalog_listings AS listing ON (product.listing_id = listing.id)
        JOIN catalog_types AS type ON (listing.type_id = type.id)
        JOIN catalog_subcategories AS subcategory ON (type.subcategory_id = subcategory.id)
        JOIN catalog_categories AS category ON (subcategory.category_id = category.id)
        JOIN catalog_store_types AS store_type ON (depot.store_type_id = store_type.id)
        JOIN catalog_packaging_containers AS container ON (product.container_id = container.id)
        JOIN catalog_packaging_volumes AS volume ON (item.volume_id = volume.id)
        JOIN catalog_packaging_packagings AS packaging ON (item.packaging_id = packaging.id)
        
        WHERE store_type.available = true
        AND ? AND ?
        
        ORDER BY listing_id, product_id, item_id, depot_id`;

    let data1 = { "store_type.name": storeType };
    let data2 = { "product.id": productId };
    let dbResult = await db.runQuery(sqlQuery, [data1, data2]);
    return getFormattedProductsForProductPage(dbResult);
}

pub.getProductPageItemsByProductId = async function (storeType, productId) {
    let isStoreOpen = await pub.isStoreOpen(storeType);
    let products = await getItemsByProductId(storeType, productId);
    let descriptions = await getDescriptionsByProductId(productId);
    let images = await getImagesByProductId(productId);

    if (products.length == 0) {
        return false;
    }
    return convertToProductPageItem(products, descriptions, images, isStoreOpen);
}

/**
 * 
 * @param {*} products - array of products
 * @param {*} descriptions
 * @param {*} images
 * @param {*} isStoreOpen
 */
var convertToProductPageItem = async function (product, descriptions, images, isStoreOpen) {
    let tmpPr = product[0];

    // Extract common fields of products
    let finalResult = {
        "store_type_name": tmpPr.store_type,
        "store_type_display_name": tmpPr.store_type_display_name,
        "category": tmpPr.category,
        "subcategory": tmpPr.subcategory,
        "type": tmpPr.type,
        "brand": tmpPr.brand,
        "name": tmpPr.name,
        "product_id": tmpPr.product_id,
        "description": tmpPr.description,
        "store_open": isStoreOpen,
        "tax": tmpPr.tax,
        "container": tmpPr.container,
        "images": [],
        "product_variants": tmpPr.product_variants,
        "details": {}
    };

    for (let i = 0; i < descriptions.length; i++) {
        finalResult.details[descriptions[i].name] = descriptions[i].description;
    }

    finalResult.images.push(tmpPr.image);

    for (let j = 0; j < images.length; j++) {
        if (images[j].name == "nutritions") {
            finalResult.images.push("/resources/images/products/" + tmpPr.category + "/nutritions/" + images[j].image);
        } else {
            finalResult.images.push("/resources/images/products/" + tmpPr.category + "/" + images[j].image);
        }
    }

    if (!finalResult.name) {
        finalResult.name = "";
    }

    if (!finalResult.brand) {
        finalResult.brand = "";
    }

    return finalResult;
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
pub.getSimilarProducts = async function (productId) {
    let result = [];
    let limit = 12;
    let sameTransaction = await getSimilarProductsBySameTransaction(productId, limit);
    limit = limit - sameTransaction.length;
    result = result.concat(sameTransaction);
    if (limit > 0) {
        let sameCustomer = await getSimilarProductsBySameCustomer(productId, limit);
        let tmpResult = [];

        for (let i = 0; i < sameCustomer.length; i++) {
            let same = false;
            for (let j = 0; j < result.length; j++) {
                if (sameCustomer[i].product_id == result[j].product_id
                    && sameCustomer[i].store_type == result[j].store_type) {
                    result[j].sum_point = sameCustomer[i].sum_point;
                    same = true;
                    break;
                }
            }

            if (!same) {
                tmpResult.push(sameCustomer[i]);
            }
        }
        result = result.concat(tmpResult);

        result.sort(function (a, b) { return (a.sum_point < b.sum_point) ? 1 : ((b.sum_point > a.sum_point) ? -1 : 0); });
    }


    for (let i = 0; i < result.length; i++) {
        var item = await getItemByProductId(result[i].store_type_name, result[i].product_id);
        result[i].type = item.type;
        result[i].subcategory = item.subcategory;
        result[i].category = item.category;
        result[i].type = item.type;
        result[i].brand = item.brand;
        result[i].name = item.name;
        result[i].image = item.image;
        result[i].price = item.price;
        result[i].container = item.container;
        result[i].volume = item.volume;
        result[i].packaging = item.packaging;
    }

    return result;
}

/**
 * Get similar products bought at the same transaction
 * 
 * @param {*} productId 
 * @param {*} limit 
 */
var getSimilarProductsBySameTransaction = async function (productId, limit) {
    if (limit > 0) {
        let sqlQuery = `
            SELECT 
            product.id AS product_id,
            store_type.name AS store_type_name,
            COUNT(*) AS sum_point

            FROM orders_cart_items
            JOIN orders_history ON (orders_cart_items.order_id = orders_history.id)
            JOIN catalog_depot AS depot ON (depot.id = orders_cart_items.depot_id)
            JOIN catalog_items AS item ON (item.id = depot.item_id)
            JOIN catalog_products AS product ON (product.id = item.product_id)
            JOIN catalog_store_types AS store_type ON (store_type.id = depot.store_type_id)

            WHERE store_type.available = true
            AND depot.available = true
            AND product.id <>  ` + productId + `
            AND orders_history.order_transaction_id IN
            (
                SELECT
                DISTINCT orders_history.order_transaction_id
                FROM orders_cart_items
                JOIN orders_history ON (orders_cart_items.order_id = orders_history.id)
                JOIN catalog_depot AS depot ON (depot.id = orders_cart_items.depot_id)
                JOIN catalog_items AS item ON (item.id = depot.item_id)
                JOIN catalog_products AS product ON (product.id = item.product_id)
                WHERE ?
            )
            GROUP BY product_id, store_type_name
            ORDER BY sum_point DESC
            LIMIT ` + limit + `;`;

        let data = { "product.id": productId };
        let dbResult = await db.runQuery(sqlQuery, data);
        return dbResult;
    } else {
        return [];
    }
}

/**
 * Get similar products bought by the same customer
 * 
 * @param {*} productId 
 * @param {*} limit 
 */
var getSimilarProductsBySameCustomer = async function (productId, limit) {
    if (limit > 0) {
        let sqlQuery = `
            SELECT              
            product_id,
            store_type_name,
            COUNT(*) AS sum_point
            FROM
                (
                SELECT 
                product.id AS product_id,
                store_type.name AS store_type_name

                FROM orders_cart_items
                JOIN orders_history ON (orders_cart_items.order_id = orders_history.id)
                JOIN catalog_depot AS depot ON (depot.id = orders_cart_items.depot_id)
                JOIN catalog_items AS item ON (item.id = depot.item_id)
                JOIN catalog_products AS product ON (product.id = item.product_id)
                JOIN catalog_store_types AS store_type ON (store_type.id = depot.store_type_id)
                JOIN orders_transactions_history AS transaction ON (orders_history.order_transaction_id = transaction.id)

                WHERE store_type.available = true
                AND depot.available = true
                AND product.id <> ` + productId + `
                AND (
                transaction.guest_id IN
                (
                    SELECT
                    DISTINCT transaction.guest_id
                    FROM orders_cart_items
                    JOIN orders_history ON (orders_cart_items.order_id = orders_history.id)
                    JOIN orders_transactions_history AS transaction ON (transaction.id = orders_history.order_transaction_id)
                    JOIN catalog_depot AS depot ON (depot.id = orders_cart_items.depot_id)
                    JOIN catalog_items AS item ON (item.id = depot.item_id)
                    JOIN catalog_products AS product ON (product.id = item.product_id)
                    WHERE ?
                )
                )
                UNION ALL
                SELECT 
                
                product.id AS product_id,
                store_type.name AS store_type_name

                FROM orders_cart_items
                JOIN orders_history ON (orders_cart_items.order_id = orders_history.id)
                JOIN catalog_depot AS depot ON (depot.id = orders_cart_items.depot_id)
                JOIN catalog_items AS item ON (item.id = depot.item_id)
                JOIN catalog_products AS product ON (product.id = item.product_id)
                JOIN catalog_store_types AS store_type ON (store_type.id = depot.store_type_id)
                JOIN orders_transactions_history AS transaction ON (orders_history.order_transaction_id = transaction.id)

                WHERE store_type.available = true
                AND depot.available = true
                AND product.id <> ` + productId + `
                AND (
                transaction.user_id IN
                (
                    SELECT
                    DISTINCT transaction.user_id
                    FROM orders_cart_items
                    JOIN orders_history ON (orders_cart_items.order_id = orders_history.id)
                    JOIN orders_transactions_history AS transaction ON (transaction.id = orders_history.order_transaction_id)
                    JOIN catalog_depot AS depot ON (depot.id = orders_cart_items.depot_id)
                    JOIN catalog_items AS item ON (item.id = depot.item_id)
                    JOIN catalog_products AS product ON (product.id = item.product_id)
                    WHERE ?
                )
                )
            ) AS T
            GROUP BY product_id, store_type_name
            ORDER BY sum_point DESC
            LIMIT ` + limit + `;`;

        let data = { "product.id": productId };
        let dbResult = await db.runQuery(sqlQuery, [data, data]);
        return dbResult;
    } else {
        return [];
    }
}

/**
 * Get a single item by product id
 * 
 * @param {*} storeType
 * @param {*} productId 
 */
var getItemByProductId = async function (storeType, productId) {
    let sqlQuery = `
        SELECT
        product.id AS product_id,
        type.name AS type,
        subcategory.name AS subcategory,
        category.name AS category,
        store_type.name AS store_type_name,
        listing.brand AS brand,
        listing.name AS name,
        product.image AS image,
        depot.price AS price,
        container.name AS container,
        volume.name AS volume,
        packaging.name AS packaging
        
        FROM
        catalog_depot AS depot JOIN catalog_items AS item ON (depot.item_id = item.id)
        JOIN catalog_products AS product ON (item.product_id = product.id)
        JOIN catalog_listings AS listing ON (product.listing_id = listing.id)
        JOIN catalog_types AS type ON (listing.type_id = type.id)
        JOIN catalog_subcategories AS subcategory ON (type.subcategory_id = subcategory.id)
        JOIN catalog_categories AS category ON (subcategory.category_id = category.id)
        JOIN catalog_store_types AS store_type ON (depot.store_type_id = store_type.id)
        JOIN catalog_packaging_containers AS container ON (container.id = product.container_id)
        JOIN catalog_packaging_packagings AS packaging ON (item.packaging_id = packaging.id)
        JOIN catalog_packaging_volumes AS volume ON (volume.id = item.volume_id)

        WHERE store_type.available = true
        AND ? AND ?
        
        ORDER BY price
        LIMIT 1`;

    let data1 = { "store_type.name": storeType };
    let data2 = { "product.id": productId };
    let dbResult = await db.runQuery(sqlQuery, [data1, data2]);
    return dbResult[0];
}

/**
 * Get all store types
 */
pub.getAllStoreTypes = async function () {
    let data = { "available": true };
    return db.selectAllWhere(db.tables.catalog_store_types, data);
}

module.exports = pub;
