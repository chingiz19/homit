/**
 * @copyright Homit 2018
 */

var pub = {};

pub.HOMIT_CAR_STORE_TYPE = "homitcar";
pub.SOLO_LIQUOR_STORE_TYPE = "solo-liquor";
const ALBERTA_GST = 0.05;
const DELIVERY_FEE_1 = 4.99;
const DELIVERY_FEE_2 = 2.99;

/**
 * Get store type name by store type api
 * 
 * @param {*} typeApi 
 */
pub.getStoreTypeByApi = async function (typeApi) {
    var data = { "api_name": typeApi };
    var storeType = await db.selectAllWhereLimitOne(db.tables.catalog_store_types, data);
    if (storeType.length > 0) {
        return storeType[0].name;
    } else {
        return false;
    }
}

/**
 * Returns true if any of the stores related to the store type is open
 * 
 * @param {*String} storeType
 */
pub.isStoreOpen = async function (storeType) {
    var sqlQuery = `
        SELECT stores.id
        FROM
        catalog_stores AS stores JOIN catalog_store_types AS store_types ON (stores.store_type = store_types.id)
        JOIN stores_hours AS hours ON (stores.id = hours.store_id)
        WHERE
        hours.day = DAYOFWEEK(CURRENT_TIMESTAMP)
        AND (hours.open_time <= CURRENT_TIME
        AND hours.close_time >= TIME(DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 MINUTE))
        OR hours.open_time_next <= CURRENT_TIME
        AND hours.close_time_next >= TIME(DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 MINUTE))
        )
        AND ?
        LIMIT 1
    `;

    var data = {
        "store_types.name": storeType
    };

    var dbResult = await db.runQuery(sqlQuery, data);
    return dbResult.length > 0;
}

/**
 * Return all products based on the store type and category provided
 * 
 * @param {*} storeType 
 * @param {*} categoryName 
 * @param {*} storeOpen 
 */
pub.getAllProductsByCategory = async function (storeType, categoryName, storeOpen) {
    var sqlQuery = `
        SELECT
        depot.id AS depot_id,
        item.id AS item_id,
        listing.id AS listing_id,
        product.id AS product_id,
        type.name AS type,
        subcategory.name AS subcategory,
        category.name AS category,
        store_type.name AS store_type,
        store_type.api_name AS store_type_api_name,
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
        
        ORDER BY listing_id, product_id, item_id, depot_id`;

    var data = [{ "category.name": categoryName }, { "store_type.name": storeType }];
    var dbResult = await db.runQuery(sqlQuery, data);
    return getFormattedProducts(dbResult, storeOpen);
}

/**
 * Format products for front-end
 * 
 * @param {*} products 
 * @param {*} storeOpen 
 */
var getFormattedProducts = function (products, storeOpen) {
    var tmpResult = {};
    var tmpSubcategories = {};

    for (var i = 0; i < products.length; i++) {

        if (!tmpSubcategories.hasOwnProperty(products[i].subcategory)) {
            tmpSubcategories[products[i].subcategory] = products[i].subcategory;
        }

        var product = products[i];
        var p_package = product.packaging;
        var p_volume = product.volume;

        var imageLocation = "/resources/images/products/" + product.category.toLowerCase() + "/";

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
                store_type_api_name: product.store_type_api_name,
                store_type_display_name: product.store_type_display_name,
                image: imageLocation + products[i].image,
                quantity: products[i].quantity,
                container: products[i].container,
                category: products[i].category,
                tax: products[i].tax,
                product_variants: {
                    all_volumes: []
                },
                store_open: storeOpen
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

    // Converting object of objects to array of objects
    var results = [];
    for (var r in tmpResult) {
        if (tmpResult.hasOwnProperty(r)) {
            results.push(tmpResult[r]);
        }
    }

    var result = {
        products: results,
        subcategories: Object.keys(tmpSubcategories)
    };

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
        var sqlQuery = `
        SELECT DISTINCT display_name AS store_type_display_name, image AS store_type_image, api_name AS store_type_api_name
        FROM catalog_store_types
        WHERE available = true
        AND display_name LIKE '%` + searchText + `%'
        LIMIT ` + limit;
        var dbResult = await db.runQuery(sqlQuery);
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
        var sqlQuery = `
        SELECT DISTINCT
        category.name AS category,
        category.display_name AS category_display_name,
        store_type.display_name AS store_type_display_name,
        store_type.api_name AS store_type_api_name,
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
        AND category.name LIKE '%` + searchText + `%'   OR category.display_name LIKE '%` + searchText + `%'
        LIMIT ` + limit;

        var dbResult = await db.runQuery(sqlQuery);
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
        var sqlQuery = `
        SELECT DISTINCT
        category.name AS category,
        category.display_name AS category_display_name,
        store_type.display_name AS store_type_display_name,
        store_type.api_name AS store_type_api_name,
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
        AND subcategory.name LIKE '%` + searchText + `%'
        LIMIT ` + limit;

        var dbResult = await db.runQuery(sqlQuery);
        return dbResult;
    } else {
        return [];
    }
}

/**
 * Search for the text in brand, name, and description
 * 
 * @param {*} searchText 
 * @param {*} limit
 */
pub.searchProducts = async function (searchText, limit) {
    var sqlSelect = `
        listing.id AS listing_id,
        product.id AS product_id,
        type.name AS type,
        subcategory.name AS subcategory,
        category.name AS category,
        store_type.display_name AS store_type_display_name,
        store_type.api_name AS store_type_api_name,
        listing.brand AS brand,
        listing.name AS name,
        product.image AS image,
        container.name AS container`;

    var sqlFrom = `
        FROM
        catalog_depot AS depot JOIN catalog_items AS item ON (depot.item_id = item.id)
        JOIN catalog_products AS product ON (item.product_id = product.id)
        JOIN catalog_listings AS listing ON (product.listing_id = listing.id)
        JOIN catalog_types AS type ON (listing.type_id = type.id)
        JOIN catalog_subcategories AS subcategory ON (type.subcategory_id = subcategory.id)
        JOIN catalog_categories AS category ON (subcategory.category_id = category.id)
        JOIN catalog_store_types AS store_type ON (depot.store_type_id = store_type.id)
        JOIN catalog_packaging_containers AS container ON (product.container_id = container.id)`;

    var sqlWhere = `
        WHERE store_type.available = true AND depot.available = true AND`;

    var sqlQuery = `
        SELECT *
        FROM ( 
            SELECT DISTINCT ` + sqlSelect
        + ` ` + sqlFrom + ` ` + sqlWhere
        + ` listing.brand LIKE '` + searchText + `%' OR listing.name LIKE '` + searchText + `%'
            OR CONCAT(listing.brand,  ' ', listing.name) LIKE '` + searchText + `%'`

        + ` UNION ` +

        `SELECT DISTINCT ` + sqlSelect
        + ` ` + sqlFrom + ` ` + sqlWhere
        + ` listing.brand LIKE '%` + searchText + `%' OR listing.name LIKE '%` + searchText + `%'
            OR CONCAT(listing.brand,  ' ', listing.name) LIKE '%` + searchText + `%'`

        + ` UNION ` +

        `SELECT DISTINCT ` + sqlSelect
        + ` ` + sqlFrom + ` `
        + `JOIN catalog_listings_descriptions AS description ON (listing.id = description.listing_id) `
        + sqlWhere
        + ` description.description LIKE '` + searchText + `%'`
        + `) AS final_products
        LIMIT ` + limit + `;`;

    var dbResult = await db.runQuery(sqlQuery);
    return dbResult;
}

/**
 * Get store type id by name
 * 
 * @param {*} storeType 
 */
pub.getStoreTypeIdByName = async function (storeType) {
    var data = { name: storeType };
    var dbResult = await db.selectAllWhereLimitOne(db.tables.catalog_store_types, data);
    if (dbResult.length > 0) {
        return dbResult[0].id;
    } else {
        return false;
    }
}

/**
 * Get all prices for products
 * 
 * @param {*} products 
 */
pub.getAllPricesForProducts = function (products) {
    if (products[pub.HOMIT_CAR_STORE_TYPE]) {
        products[pub.SOLO_LIQUOR_STORE_TYPE] = Object.assign(products[pub.SOLO_LIQUOR_STORE_TYPE], products[pub.HOMIT_CAR_STORE_TYPE]);
        delete products[pub.HOMIT_CAR_STORE_TYPE];
    }
    return pub.calculatePrice(products);
}

/**
 * Calculate prices for products
 * 
 * @param {*} products 
 */
pub.calculatePrice = function (products) {
    var totalAmount = 0;
    var totalTax = 0;
    var totalDelivery = 0;

    for (let storeType in products) {
        var tmpAmount = 0;
        var tmpTax = 0;
        for (let item in products[storeType]) {
            tmpAmount = tmpAmount + parseFloat(products[storeType][item].price) * products[storeType][item].quantity;
            if (products[storeType][item].tax) {
                tmpTax = tmpTax + parseFloat(products[storeType][item].price) * products[storeType][item].quantity * ALBERTA_GST;
            }
        }
        var tmpDelivery = DELIVERY_FEE_1 + Math.floor(parseInt(tmpAmount / 100)) * DELIVERY_FEE_2;
        tmpTax = Math.round((tmpTax + tmpDelivery * ALBERTA_GST) * 100) / 100;

        totalAmount = totalAmount + tmpAmount;
        totalDelivery = totalDelivery + tmpDelivery;
        totalTax = totalTax + tmpTax;
    }

    var totalPrice = totalAmount + totalTax + totalDelivery;

    // Updating display variables
    totalTax = parseFloat(totalTax.toFixed(2));
    totalAmount = parseFloat(totalAmount.toFixed(2));
    totalDelivery = parseFloat(totalDelivery.toFixed(2));
    totalPrice = parseFloat(totalPrice.toFixed(2));

    var finalPrices = {
        "cart_amount": totalAmount,
        "delivery_fee": totalDelivery,
        "total_tax": totalTax,
        "total_price": totalPrice
    };

    return finalPrices;
}

/**
 * Get cart products by depot ids
 * 
 * @param {*} cartProducts 
 */
pub.getCartProducts = async function (cartProducts) {
    var depotIds = Object.keys(cartProducts);

    var sqlQuery = `
        SELECT depot.id AS depot_id,
        depot.price AS price, depot.tax AS tax,
        store_type.name AS store_type
        FROM catalog_depot AS depot JOIN catalog_store_types AS store_type ON(depot.store_type_id = store_type.id)
        WHERE depot.id in (` + depotIds + `)
        ORDER BY store_type`;

    var dbResult = await db.runQuery(sqlQuery);
    return dbResult;
}

/**
 * Get cart products with respective store type
 * 
 * @param {*} dbProducts
 * @param {*} cartProducts
 */
pub.getCartProductsWithStoreType = function (dbProducts, cartProducts) {
    var products = {};
    var currentStoreType = {};
    for (var i = 0; i < dbProducts.length; i++) {
        var tmpQuantity;
        if (cartProducts) {
            tmpQuantity = cartProducts[dbProducts[i].depot_id];
        } else {
            tmpQuantity = dbProducts[i].quantity;
        }
        var currentItem = {
            depot_id: dbProducts[i].depot_id,
            price: dbProducts[i].price,
            tax: dbProducts[i].tax,
            quantity: tmpQuantity
        };


        if (i == 0) {
            currentStoreType[dbProducts[i].depot_id] = currentItem;
        } else {
            if (dbProducts[i - 1].store_type != dbProducts[i].store_type) {
                products[dbProducts[i - 1].store_type] = currentStoreType;
                currentStoreType = {};
            }
            currentStoreType[dbProducts[i].depot_id] = currentItem;
        }

        if (i == dbProducts.length - 1) {
            products[dbProducts[i].store_type] = currentStoreType;
        }
    }

    return products;
}

/**
 * Get store type by id
 * 
 * @param {*} typeId 
 */
pub.getStoreTypeById = async function (typeId) {
    var data = { id: typeId };
    var dbResult = await db.selectAllWhereLimitOne(db.tables.catalog_store_types, data);
    return dbResult[0];
}

/**
 * Get store type by listing id
 * 
 * @param {*} listingId 
 */
pub.getStoreTypeByListing = async function (listingId) {
    var sqlQuery = `
        SELECT store_type.name AS store_type
        FROM catalog_listings AS listing JOIN catalog_products AS product ON(listing.id = product.listing_id)
        JOIN catalog_items AS item ON(product.id = item.product_id)
        JOIN catalog_depot AS depot ON(item.id = depot.item_id)
        JOIN catalog_store_types AS store_type ON(depot.store_type_id = store_type.id)
        WHERE ?
        LIMIT 1`;

    var data = { "listing.id": listingId };
    var dbResult = await db.runQuery(sqlQuery, data);

    // TODO: check for returned error, etc.
    if (dbResult && dbResult.length > 0) {
        return dbResult[0].store_type;
    } else {
        return false;
    }
}

/**
 * Get products by listing id
 * 
 * @param {*} listingId 
 * @param {*} isStoreOpen 
 */
pub.getProductsByListingId = async function (listingId, isStoreOpen) {
    var sqlQuery = `
        SELECT
        depot.id AS depot_id,
        item.id AS item_id,
        listing.id AS listing_id,
        product.id AS product_id,
        type.name AS type,
        subcategory.name AS subcategory,
        category.name AS category,
        store_type.name AS store_type,
        store_type.api_name AS store_type_api_name,
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
        
        WHERE ?
        
        ORDER BY listing_id, product_id, item_id, depot_id`;

    var data = { "listing.id": listingId };
    var dbResult = await db.runQuery(sqlQuery, data);
    return getFormattedProducts(dbResult, isStoreOpen);
}

/**
 * Get all descriptions for the listing id
 * 
 * @param {*} listingId 
 */
var getDescriptionsByListingId = async function (listingId) {
    var sqlQuery = `
        SELECT name.name AS name, description.description AS description
        FROM catalog_listings AS listing
        JOIN catalog_listings_descriptions AS description ON (listing.id = description.listing_id)
        JOIN catalog_description_names AS name ON (description.description_key = name.id)
        WHERE ?`;

    var data = { "listing.id": listingId };
    var dbResult = await db.runQuery(sqlQuery, data);
    return dbResult;
}


var getImagesByProductId = async function (productId) {
    var sqlQuery = `
        SELECT name.name AS name, image.image AS image, image.product_id AS product_id
        FROM catalog_image_names AS name
        JOIN catalog_products_images AS image ON (name.id = image.image_key)
        WHERE ?`;

    var data = { "image.product_id": productId };
    return await db.runQuery(sqlQuery, data);
}

pub.getProductPageProductsByListingId = async function (listingId) {
    // Get super category for listing
    var storeType = await Catalog.getStoreTypeByListing(listingId);

    // ListingId in URL might be wrong, need to check that
    if (!storeType) {
        return false;
    }

    // get store open
    var isStoreOpen = await Catalog.isStoreOpen(storeType);
    var products = await Catalog.getProductsByListingId(listingId, isStoreOpen);
    var descriptions = await getDescriptionsByListingId(listingId);
    return convertToProductPageItem(products.products, descriptions);
}

/**
 * 
 * @param {*} products - array of products
 * @param {*} descriptions
 */
var convertToProductPageItem = async function (products, descriptions) {
    var tmpPr = products[0];

    var finalDescriptions = {};

    // Extract common fields of products
    var finalResult = {
        "store_type_api_name": tmpPr.store_type_api_name,
        "store_type_display_name": tmpPr.store_type_display_name,
        "category": tmpPr.category,
        "subcategory": tmpPr.subcategory,
        "type": tmpPr.type,
        "brand": tmpPr.brand,
        "name": tmpPr.name,
        "description": tmpPr.description,
        "store_open": tmpPr.store_open,
        "tax": tmpPr.tax,
        "products": {},
        "details": {}
    };

    for (let i = 0; i < descriptions.length; i++) {
        finalResult.details[descriptions[i].name] = descriptions[i].description;
    }

    if (!finalResult.name) {
        finalResult.name = "";
    }

    if (!finalResult.brand) {
        finalResult.brand = "";
    }

    // Add product variants
    // We expect not to have duplicate containers in the array
    for (let i = 0; i < products.length; i++) {
        let product = products[i];
        let other_images = await getImagesByProductId(product.product_id);
        finalResult.products[product.container] = {
            "image": product.image,
            "product_variants": product.product_variants,
            "other_images": other_images
        }
    }
    return finalResult;
}

/**
 * Check if store open for the products in checkout
 * 
 * @param {*} depotIds 
 */
pub.checkProductsForStoreOpen = async function (depotIds) {
    var sqlQuery = `
        SELECT depot.id AS depot_id,
        store_type.name AS store_type,
        store_type.api_name AS store_type_api_name
        FROM catalog_depot AS depot JOIN catalog_store_types AS store_type ON(depot.store_type_id = store_type.id)
        WHERE depot.id in (` + depotIds + `)
        ORDER BY store_type_api_name`;

    var dbProducts = await db.runQuery(sqlQuery);

    var products = {};
    var currentStoreType = {};
    var storeOpen;
    var allStoresOpen = true;
    for (let i = 0; i < dbProducts.length; i++) {
        if (i == 0) {
            storeOpen = await pub.isStoreOpen(dbProducts[i].store_type);
            if (allStoresOpen && !storeOpen) {
                allStoresOpen = false;
            }
            currentStoreType[dbProducts[i].depot_id] = storeOpen;
        } else {
            if (dbProducts[i - 1].store_type_api_name != dbProducts[i].store_type_api_name) {
                products[dbProducts[i - 1].store_type_api_name] = currentStoreType;
                currentStoreType = {};
                storeOpen = await pub.isStoreOpen(dbProducts[i].store_type);
                if (allStoresOpen && !storeOpen) {
                    allStoresOpen = false;
                }
            }
            currentStoreType[dbProducts[i].depot_id] = storeOpen;
        }

        if (i == dbProducts.length - 1) {
            products[dbProducts[i].store_type_api_name] = currentStoreType;
        }
    }

    var finalResult = {
        all_stores_open: allStoresOpen,
        products: products
    };

    return finalResult;
}


// old
//CSR
pub.getCartProductsWithInfo = function (cartProducts) {
    var depotIds = Object.keys(cartProducts);
    var sqlQuery = `
        SELECT depot.id AS depot_id, depot.product_id AS product_id,
        listing.id AS listing_id, subcategory.name AS subcategory, type.name AS type,
        listing.product_brand AS brand, listing.product_name AS name,
        listing.product_description AS description, product.product_image AS image,
        depot.price AS price, depot.tax AS tax, depot.quantity AS quantity, packaging.name AS packaging,
        container.name AS container, volume.volume_name AS volume, category.name AS category,
        super_category.name AS super_category

        FROM catalog_depot AS depot, catalog_products AS product, catalog_listings AS listing,
        catalog_categories AS category, catalog_types AS type, catalog_subcategories AS subcategory,
        catalog_containers AS container, catalog_packagings AS packaging, catalog_packaging_volumes AS volume,
        catalog_super_categories AS super_category

        WHERE depot.product_id = product.id AND product.listing_id = listing.id
        AND type.id = listing.type_id AND type.subcategory_id = subcategory.id
        AND container.id = product.container_id AND packaging.id = depot.packaging_id
        AND depot.packaging_volume_id = volume.id AND category.id = subcategory.category_id AND
        category.super_category_id = super_category.id
        AND depot.id in (` + depotIds + `)

        ORDER BY super_category`;

    return db.runQuery(sqlQuery).then(function (dbResult) {
        return dbResult;
    });
};

pub.searchDepotProducts = function (searchText) {
    var sqlQuery = `
            SELECT depot.id AS depot_id, depot.product_id AS product_id,
                listing.id AS listing_id, subcategory.name AS subcategory, type.name AS type,
                    listing.product_brand AS brand, listing.product_name AS name,
                        listing.product_description AS description, product.product_image AS image,
                            depot.price AS price, depot.tax AS tax, depot.quantity AS quantity, packaging.name AS packaging,
                                container.name AS container, volume.volume_name AS volume, category.name AS category,
                                    super_category.name AS super_category

            FROM catalog_depot AS depot, catalog_products AS product, catalog_listings AS listing,
                catalog_categories AS category, catalog_types AS type, catalog_subcategories AS subcategory,
                    catalog_containers AS container, catalog_packagings AS packaging, catalog_packaging_volumes AS volume,
                        catalog_super_categories AS super_category

            WHERE depot.product_id = product.id AND product.listing_id = listing.id
            AND type.id = listing.type_id AND type.subcategory_id = subcategory.id
            AND container.id = product.container_id AND packaging.id = depot.packaging_id
            AND depot.packaging_volume_id = volume.id AND category.id = subcategory.category_id AND
            category.super_category_id = super_category.id

            AND(listing.product_brand LIKE '%` + searchText + `%' OR listing.product_name LIKE '%` + searchText + `%'
        OR listing.product_description LIKE '%` + searchText + `%' OR listing.product_country LIKE '%` + searchText + `%') `;

    return db.runQuery(sqlQuery).then(function (dbResult) {
        return dbResult;
    });
};

/**
 * Custom function to do alphanumeric sort
 * Source: http://stackoverflow.com/questions/4340227/sort-mixed-alpha-numeric-array
 */
var reA = /[^a-zA-Z]/g;
var reN = /[^0-9]/g;
function sortAlphaNum(a, b) {
    var aA = a.replace(reA, "");
    var bA = b.replace(reA, "");
    if (aA === bA) {
        var aN = parseInt(a.replace(reN, ""), 10);
        var bN = parseInt(b.replace(reN, ""), 10);
        return aN === bN ? 0 : aN > bN ? 1 : -1;
    } else {
        return aA > bA ? 1 : -1;
    }
};

module.exports = pub;
