/**
 * @copyright Homit 2017
 */
var router = require("express").Router();

router.use('/', function (req, res, next) {
    var tempArray = req.path.split('/');
    var superCategory = tempArray[1];
    var categoryName = tempArray[2];

    if (superCategory == "snackvendor") {
        next();
    } else {
        Catalog.isStoreOpen(superCategory).then(function (storeOpen) {
            Catalog.getAllProductsByCategory(superCategory, categoryName, storeOpen).then(function (products) {
                if (products != false) {
                    var allBrands = Catalog.getAllBrands(products);
                    Catalog.getAllTypes(products).then(function (subcategories) {
                        var response = {
                            success: true,
                            store_open: storeOpen,
                            all_brands: allBrands,
                            subcategories: subcategories,
                            products: products
                        };
                        res.send(response);
                    });
                } else {
                    next();
                }
            });
        });
    }
});

router.use('/snackvendor', function (req, res, next) {
    var safewaySuperCategory = "safeway";
    var convenienceSuperCategory = "convenience";
    var tempArray = req.path.split('/');
    var categoryName = tempArray[1];

    Catalog.isStoreOpen(safewaySuperCategory).then(function (safewayOpen) {
        if (!safewayOpen) {
            Catalog.getCategoryOnlyProducts(safewaySuperCategory, categoryName, safewayOpen, convenienceSuperCategory, categoryName).then(function (safewayOnlyProducts) {
                if (safewayOnlyProducts != false) {
                    Catalog.isStoreOpen(convenienceSuperCategory).then(function (convenienceOpen) {
                        Catalog.getAllProductsByCategory(convenienceSuperCategory, categoryName, convenienceOpen).then(function (convenienceProducts) {
                            if (convenienceProducts != false) {
                                var finalProducts = safewayOnlyProducts.concat(convenienceProducts);
                                var allBrands = Catalog.getAllBrands(finalProducts);
                                Catalog.getAllTypes(finalProducts).then(function (subcategories) {

                                    var response = {
                                        success: true,
                                        store_open: convenienceOpen,
                                        all_brands: allBrands,
                                        subcategories: subcategories,
                                        products: finalProducts
                                    };
                                    res.send(response);
                                });
                            } else {
                                next();
                            }
                        });
                    });
                } else {
                    next();
                }
            });
        } else {
            Catalog.getAllProductsByCategory(safewaySuperCategory, categoryName, safewayOpen).then(function (products) {
                if (products != false) {
                    var allBrands = Catalog.getAllBrands(products);
                    Catalog.getAllTypes(products).then(function (subcategories) {
                        var response = {
                            success: true,
                            store_open: safewayOpen,
                            all_brands: allBrands,
                            subcategories: subcategories,
                            products: products
                        };
                        res.send(response);
                    });
                } else {
                    next();
                }
            });
        }
    });
});

router.post('/search', function (req, res, next) {
    var searchText = req.body.search;
    if (searchText.length < 3) {
        var response = {
            success: false
        };
        res.send(response);
    }
    Catalog.searchSuperCategory(searchText).then(function (superCategories) {
        if (superCategories != false) {
            var response = {
                success: true,
                result: superCategories
            };
            res.send(response);
        } else {
            Catalog.searchCategory(searchText).then(function (categories) {
                if (categories != false) {
                    var response = {
                        success: true,
                        result: categories
                    };
                    res.send(response);
                } else {
                    Catalog.searchSubcategory(searchText).then(function (subcategories) {
                        if (subcategories != false) {
                            var response = {
                                success: true,
                                result: subcategories
                            };
                            res.send(response);
                        } else {
                            Catalog.searchProducts(searchText).then(function (products) {
                                if (products != false) {
                                    var resultProducts = {
                                        products: products
                                    };
                                    var response = {
                                        success: true,
                                        result: resultProducts
                                    };
                                    res.send(response);
                                } else {
                                    var response = {
                                        success: true,
                                        result: []
                                    };
                                    res.send(response);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
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