/**
 * @copyright Homit 2018
 */
var router = require("express").Router();

router.use('/', function (req, res, next) {
    var tempArray = req.path.split('/');
    var superCategory = tempArray[1];
    var categoryName = tempArray[2];

    if (superCategory == Catalog.snackVendorSuperCategory) {
        next();
    } else {
        Catalog.isStoreOpen(superCategory).then(function (storeOpen) {
            Catalog.getAllProductsByCategory(superCategory, categoryName, storeOpen).then(function (products) {
                if (products.length > 0) {
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

router.use('/snack-vendor', function (req, res, next) {
    var tempArray = req.path.split('/');
    var categoryName = tempArray[1];
    var homitCarOpen = true;

    Catalog.getAllProductsByCategory(Catalog.homitCarSuperCategory, categoryName, homitCarOpen).then(function (homitCarProducts) {
        Catalog.isStoreOpen(Catalog.safewaySuperCategory).then(function (safewayOpen) {
            if (!safewayOpen) {
                Catalog.getCategoryOnlyProducts(Catalog.safewaySuperCategory, categoryName, safewayOpen, Catalog.convenienceSuperCategory, categoryName).then(function (safewayOnlyProducts) {
                    Catalog.isStoreOpen(Catalog.convenienceSuperCategory).then(function (convenienceOpen) {
                        Catalog.getAllProductsByCategory(Catalog.convenienceSuperCategory, categoryName, convenienceOpen).then(function (convenienceProducts) {
                            var newProducts = convenienceProducts.concat(homitCarProducts);
                            var finalProducts = newProducts.concat(safewayOnlyProducts);
                            if (finalProducts.length > 0) {
                                var allBrands = Catalog.getAllBrands(finalProducts);
                                Catalog.getAllTypes(finalProducts).then(function (subcategories) {
                                    var response = {
                                        success: true,
                                        store_open: convenienceOpen || homitCarOpen,
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
                });
            } else {
                Catalog.getAllProductsByCategory(Catalog.safewaySuperCategory, categoryName, safewayOpen).then(function (safewayProducts) {
                    var finalProducts = safewayProducts.concat(homitCarProducts);
                    if (finalProducts.length > 0) {
                        var allBrands = Catalog.getAllBrands(finalProducts);
                        Catalog.getAllTypes(finalProducts).then(function (subcategories) {
                            var response = {
                                success: true,
                                store_open: homitCarOpen || safewayOpen,
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
            }
        });
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

    Catalog.searchSuperCategorySpecial(searchText).then(function (superCategories) {
        Catalog.searchCategorySpecial(searchText).then(function (categories) {
            Catalog.searchSubcategorySpecial(searchText).then(function (subcategories) {
                Catalog.searchProductsSpecial(searchText).then(function (products) {
                    var finalResult = {
                        super_category: superCategories,
                        category: categories,
                        subcategory: subcategories,
                        products: products
                    };
                    var response = {
                        success: true,
                        result: finalResult
                    };
                    res.send(response);
                });
            });
        });
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

router.post('/getlisting', async function (req, res, next) {
    var listingId = req.body.listing_id;

    // Get super category for listing
    var superCategory = await Catalog.getSuperCategoryByListing(listingId);

    // get store open
    var isStoreOpen = await Catalog.isStoreOpen(superCategory);
    var products;
    // if store open or not safeway
    if (isStoreOpen || (superCategory != Catalog.safewaySuperCategory)) {
        products = await Catalog.getProductsByListingId(listingId, isStoreOpen);
    } else {
        // else super category is safeway and store is closed

        // find alternative listing
        var altListingId = await Catalog.findAlternativeListing(listingId);
        var altSuperCategory = await Catalog.getSuperCategoryByListing(altListingId);

        // get store open
        var altIsStoreOpen = await Catalog.isStoreOpen(altSuperCategory);
        // get products
        products = await Catalog.getProductsByListingId(altListingId, altIsStoreOpen);
    }

    var response = {
        success: true,
        result: products
    };
    res.send(response);
});

module.exports = router;