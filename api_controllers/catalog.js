/**
 * @copyright Homit 2017
 */
var router = require("express").Router();
router.use('/', function (req, res, next) {
    var tempArray = req.path.split('/');
    var superCategory = tempArray[1];
    var categoryName = tempArray[2];
    Catalog.getAllProductsByCategory(superCategory, categoryName).then(function (products) {
        if (products != false) {
            var allBrands = Catalog.getAllBrands(products);
            Catalog.getAllTypes(products).then(function (subcategories) {
                var response = {
                    success: true,
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

module.exports = router;