/**
 * @copyright Homit 2018
 */
var router = require("express").Router();

router.get('/:storeType/:categoryName', async function (req, res, next) {
    let storeType = req.params.storeType;
    let categoryName = req.params.categoryName;

    let categoryProducts = await Catalog.getAllProductsByCategory(storeType, categoryName);
    let storeTypeInfo = await Catalog.getStoreTypeInfo(storeType);
    let categories = await Catalog.getCategoriesByStoreType(storeType);
    let storeOpen = await Catalog.isStoreOpen(storeType);
    let subcategories = await Catalog.getAllSubcategoriesByCategory(storeType, categoryName);

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
        "subcategories": subcategories,
        products: categoryProducts
    };

    res.send(response);
});

router.get('/allstores', async function (req, res, next) {
    let storeTypes = await Catalog.getAllStoreTypesAndUnions();

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
            del_fee: storeTypeInfo.del_fee_primary,
            scheduler_cycle: storeTypeInfo.notice_period,
            scheduler_incerements : SCHEDULER_INCREMENTS
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

router.get('/:storeType', async function (req, res) {
    let storeType = req.params.storeType;

    if (await Catalog.isParentUnion(storeType)) {
        let unionStores = await Catalog.getUnionStores(storeType);
        return res.send({
            success: unionStores && true,
            stores: unionStores
        });
    } else {
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
    }
});

router.post('/similarproducts', async function (req, res) {
    let limit = req.body.limit;
    let productId = req.body.product_id;

    if (limit && !isNaN(limit)) {
        let products = await Catalog.getSimilarProducts(limit, productId);
        if (products && products.length > 0) {
            return res.send({
                success: true,
                result: products,
            });
        } else {
            return res.send({
                success: false
            });
        }
    } else {
        return ErrorMessages.sendErrorResponse(res);
    }
});

router.post('/autocomplete', async function (req, res, next) {
    let searchText = req.body.search;
    if (searchText.length >= 3) {
        let limit = 7;
        let storeTypes = await Catalog.searchStoreType(searchText, limit);
        limit = limit - storeTypes.length;
        if (limit > 0) {
            MDB.suggestSearch(searchText, limit, function (products) {
                res.send({
                    success: true,
                    result: {
                        "store_type": storeTypes,
                        "products": products
                    }
                });
            });
        }
    } else {
        res.send({
            success: false
        });
    }
});

router.post('/search', async function (req, res, next) {
    let searchText = req.body.search;
    if (searchText && searchText.length >= 3) {
        let limit = 7;
        let storeTypes = await Catalog.searchStoreType(searchText, limit);
        limit = limit - storeTypes.length;
        if (limit > 0) {
            MDB.globalSearch(searchText, function (products) {
                res.send({
                    success: true && products,
                    result: {
                        "store_type": storeTypes,
                        "products": products
                    }
                });
            });
        }
    } else {
        res.send({ success: false });
    }
});

module.exports = router;