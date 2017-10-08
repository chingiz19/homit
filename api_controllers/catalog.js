/**
 * @copyright Homit 2017
 */
var router = require("express").Router();

router.use('/', function (req, res, next) {
    var tempArray = req.path.split('/');
    var superCategory = tempArray[1];
    var categoryName = tempArray[2];
    Catalog.getAllProductsByCategory(superCategory, categoryName).then(function (products) {
        if (products!=false) {
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

module.exports = router;