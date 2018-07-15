/**
 * @copyright Homit 2018
 */
var router = require("express").Router();

router.get('/:storeType/:categoryName', async function (req, res, next) {
    let storeType = req.params.storeType;
    let categoryName = req.params.categoryName;

    let productsBySubcat = await Catalog.getAllProductsByCategory(storeType, categoryName);
    let storeTypeInfo = await Catalog.getStoreTypeInfo(storeType);
    let categories = await Catalog.getCategoriesByStoreType(storeType);
    let storeOpen = await Catalog.isStoreOpen(storeType);
    let storeInfo = {
        name: storeTypeInfo.name,
        display_name: storeTypeInfo.display_name,
        image_cover: storeTypeInfo.image_cover,
        store_open: storeOpen
    };

    let response = {
        success: true,
        store_info: storeInfo,
        categories: categories,
        subcategories: productsBySubcat.subcategories,
        products: productsBySubcat.products
    };
    res.send(response);
});

router.get('/allstores', async function (req, res, next) {
    let storeTypes = await Catalog.getAllStoreTypes();

    let response = {
        success: true,
        store_types: storeTypes
    };
    res.send(response);
});

router.get('/mainspecials', async function (req, res, next) {
    let specials = await Catalog.getAllMainSpecials();

    let response = {};
    if (specials == false) {
        response = {
            success: false
        };
    } else {
        response = {
            success: true,
            specials: specials
        };
    }
    res.send(response);
});

router.use('/getstoreinfo', async function (req, res, next) {
    let storeTypes = req.body.store_type;
    let store_infos = [];

    for (let storeType of storeTypes) {
        let storeOpen = await Catalog.isStoreOpen(storeType);
        let hours = await Catalog.getStoreHours(storeType);
        let hoursScheduled = await Catalog.getStoreHours(storeType, true);
        let storeTypeInfo = await Catalog.getStoreTypeInfo(storeType);
        let storeInfo = {
            open: storeOpen,
            name: storeTypeInfo.name,
            display_name: storeTypeInfo.display_name,
            image: storeTypeInfo.image,
            hours: hours,
            hours_scheduled: hoursScheduled,
            del_fee: storeTypeInfo.del_fee_primary
        };
        store_infos.push(storeInfo);
    }

    if (store_infos.length > 0) {
        res.send({
            success: true,
            store_infos: store_infos
        });
    } else {
        ErrorMessages.sendErrorResponse(res);
    }
});

router.post('/search', async function (req, res, next) {
    let searchText = req.body.search;
    let response;
    if (searchText.length >= 3) {
        let limit = 7;
        let storeTypes = await Catalog.searchStoreType(searchText, limit);
        limit = limit - storeTypes.length;
        let categories = await Catalog.searchCategory(searchText, limit);
        limit = limit - categories.length;
        let subcategories = await Catalog.searchSubcategory(searchText, limit);
        limit = limit - subcategories.length;
        let productsStart = await Catalog.searchProductsStart(searchText, limit);
        limit = limit - productsStart.length;
        let productsTypes = await Catalog.searchProductsTypes(searchText, limit);
        limit = limit - productsTypes.length;
        let productsWithDescription = await Catalog.searchProductsWithDescription(searchText, limit);
        limit = limit - productsWithDescription.length;
        let productsEnd = await Catalog.searchProductsEnd(searchText, limit);

        let finalResult = {
            store_type: storeTypes,
            category: categories,
            subcategory: subcategories,
            products_start: productsStart,
            products_types: productsTypes,
            products_end: productsEnd,
            products_descr: productsWithDescription
        };
        response = {
            success: true,
            result: finalResult
        };
    } else {
        response = {
            success: false
        };
    }
    res.send(response);
});

router.get('/:storeType', async function (req, res) {
    let storeType = req.params.storeType;
    let user = Auth.getSignedUser(req);

    let appliedCoupons = {};
    let storeOpen = await Catalog.isStoreOpen(storeType);
    let hours = await Catalog.getStoreHours(storeType);
    let hoursScheduled = await Catalog.getStoreHours(storeType, true);
    let info = await Catalog.getStoreTypeInfo(storeType);
    let banners = await Catalog.getBannersByStoreType(storeType);
    let categories = await Catalog.getCategoriesByStoreType(storeType);
    let specials = await Catalog.getAllSpecialsByStoreType(storeType);
    let storeCoupons = await Coupon.getStoreCoupons(storeType);

    if (user && user.id) {
        appliedCoupons = HelperUtils.formatUserCoupons(await Coupon.getUserCoupons(user.id, true))
    }

    res.send({
        success: true,
        store_info: info,
        open: storeOpen,
        hours: hours,
        hours_scheduled: hoursScheduled,
        banners: banners,
        categories: categories,
        specials: specials,
        store_coupons: storeCoupons,
        applied_coupons: appliedCoupons
    });
});

module.exports = router;