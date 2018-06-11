/**
 * @copyright Homit 2018
 */
var router = require("express").Router();

router.use('/', async function (req, res, next) {
    var tempArray = req.path.split('/');
    var storeTypeApi = tempArray[1];
    var categoryName = tempArray[2];

    if (categoryName) {
        var storeType = await Catalog.getStoreTypeByApi(storeTypeApi);
        if (storeType) {
            var storeOpen = await Catalog.isStoreOpen(storeType);
            var result = await Catalog.getAllProductsByCategory(storeType, categoryName, storeOpen);
            var storeTypeInfo = await Catalog.getStoreTypeInfo(storeType);
            var storeInfo = {
                open: storeOpen,
                api_name: storeTypeInfo.api_name,
                name: storeTypeInfo.name,
                display_name: storeTypeInfo.display_name,
                image: storeTypeInfo.image,
                image_cover: storeTypeInfo.image_cover
            };

            var response = {
                success: true,
                store_info: storeInfo,
                subcategories: result.subcategories,
                products: result.products
            };
            res.send(response);
        } else {
            next();
        }
    } else {
        next();
    }
});


router.use('/getstoreinfo', async function (req, res, next) {
    let storeTypeApis = req.body.store_type;
    let store_infos = [];

    for (let storeTypeApi of storeTypeApis){
        let storeType = await Catalog.getStoreTypeByApi(storeTypeApi);
        if (storeType) {
            let storeOpen = await Catalog.isStoreOpen(storeType);
            let hours = await Catalog.getStoreHours(storeType);
            let hoursScheduled = await Catalog.getStoreHours(storeType, true);
            let storeTypeInfo = await Catalog.getStoreTypeInfo(storeType);
            let storeInfo = {
                open: storeOpen,
                api_name: storeTypeInfo.api_name,
                name: storeTypeInfo.name,
                display_name: storeTypeInfo.display_name,
                image: storeTypeInfo.image,
                hours: hours,
                hours_scheduled: hoursScheduled,
                del_fee: storeTypeInfo.del_fee_primary
            };
            store_infos.push(storeInfo);
        }
    }

    if (store_infos.length > 0){
        res.send({
            success: true,
            store_infos: store_infos
        });
    } else {
        errorMessages.sendErrorResponse(res);
    }
});

router.post('/search', async function (req, res, next) {
    var searchText = req.body.search;
    var response;
    if (searchText.length >= 3) {
        var limit = 7;
        var storeTypes = await Catalog.searchStoreType(searchText, limit);
        limit = limit - storeTypes.length;
        var categories = await Catalog.searchCategory(searchText, limit);
        limit = limit - categories.length;
        var subcategories = await Catalog.searchSubcategory(searchText, limit);
        limit = limit - subcategories.length;
        var productsStart = await Catalog.searchProductsStart(searchText, limit);
        limit = limit - productsStart.length;
        var productsWithDescription = await Catalog.searchProductsWithDescription(searchText, limit);
        limit = limit - productsWithDescription.length;
        var productsEnd = await Catalog.searchProductsEnd(searchText, limit);

        var finalResult = {
            store_type: storeTypes,
            category: categories,
            subcategory: subcategories,
            products_start: productsStart,
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

router.post('/searchdepot', function (req, res, next) {
    var searchText = req.body.search;
    if (searchText.length < 3) {
        var response = {
            success: false
        };
        res.send(response);
    } else {
        Catalog.searchDepotProducts(searchText).then(function (products) {
            var resultProducts = {
                products: products
            };
            var response = {
                success: true,
                result: resultProducts
            };
            res.send(response);
        });
    }
});

module.exports = router;