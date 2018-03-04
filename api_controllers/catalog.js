/**
 * @copyright Homit 2018
 */
var router = require("express").Router();

var concat = require('unique-concat');

router.use('/', async function (req, res, next) {
    var tempArray = req.path.split('/');
    var storeTypeApi = tempArray[1];
    var categoryName = tempArray[2];

    if (categoryName) {
        if (storeTypeApi == Catalog.snackVendorStoreType) {
            next();
        } else {
            var storeType = await Catalog.getStoreTypeByApi(storeTypeApi);
            if (storeType) {
                var storeOpen = await Catalog.isStoreOpen(storeType);
                var result = await Catalog.getAllProductsByCategory(storeType, categoryName, storeOpen);
                var response = {
                    success: true,
                    store_open: storeOpen,
                    subcategories: result.subcategories,
                    products: result.products
                };
                res.send(response);
            } else {
                next();
            }
        }
    } else {
        next();
    }
});

router.use('/snack-vendor', async function (req, res, next) {
    var tempArray = req.path.split('/');
    var categoryName = tempArray[1];

    if (categoryName) {
        var safewayOpen = await Catalog.isStoreOpen(Catalog.safewayStoreType);
        var subcategories;
        var products;
        if (safewayOpen) {
            var result = await Catalog.getAllProductsByCategoryWithHomitCar(Catalog.safewayStoreType, categoryName, safewayOpen);
            subcategories = result.subcategories;
            products = result.products;
        } else {
            var safewayOnlyResult = await Catalog.getAllProductsByCategorySafewayOnly(categoryName, safewayOpen);
            var newResult = await Catalog.getAllProductsByCategoryWithHomitCar(Catalog.sevenElevenStoreType, categoryName, true);

            subcategories = concat(newResult.subcategories, safewayOnlyResult.subcategories);
            products = newResult.products.concat(safewayOnlyResult.products);
        }
        var response = {
            success: true,
            store_open: true,
            subcategories: subcategories,
            products: products
        };
        res.send(response);
    } else {
        next();
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
        var products = await Catalog.searchProducts(searchText, limit);

        var finalResult = {
            store_type: storeTypes,
            category: categories,
            subcategory: subcategories,
            products: products
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