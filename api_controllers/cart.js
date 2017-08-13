var router = require("express").Router();

router.get('/usercart', function (req, res, next) {
    if (!req.session.user) {
        res.json({
            error: {
                code: "C001",
                "ui_message": "User is not signed in"
            }
        });
    } else {
        var user_id = req.session.user.id;
        getUserCart(user_id).then(function (cart) {
            var objectCart = cart;
            var response = {
                success: true,
                cart: objectCart
            }
            res.send(response);
            console.log(response);
        });
    }
});

router.post('/modifyitem', function (req, res, next) {
    var depot_id = req.body.depot_id;
    var quantity = req.body.quantity;
    var variant_i = req.body.variant_i;

    if (!req.session.user) {
        res.json({
            error: {
                code: "C001",
                "ui_message": "User is not signed in"
            }
        });
    } else {
        var user_id = req.session.user.id;
        modifyProductInCart(user_id, depot_id, quantity, variant_i).then(function (result) {
            var isSuccess = false;
            if (result != false) {
                isSuccess = true;
            }
            var response = {
                success: isSuccess
            };
            res.send(response);
        });
    }

});

router.post('/clear', function (req, res, next) {
    if (!req.session.user) {
        res.json({
            error: {
                code: "C001",
                "ui_message": "User is not signed in"
            }
        });
    } else {
        var user_id = req.session.user.id;
        clearCart(user_id).then(function (result) {
            var isSuccess = false;
            if (result != false) {
                isSuccess = true;
            }
            var response = {
                success: isSuccess
            };
            res.send(response);
        });

    }

});


/**
 * Return quantity based on the user id, depot id provided
 */
var getCartProduct = function (user_id, depot_id) {
    var user_cart_info = "user_cart_info";
    var data1 = {
        user_id: user_id
    };
    var data2 = {
        depot_id: depot_id
    };
    return db.selectQuery2(user_cart_info, [data1, data2]).then(function (dbResult) {
        if (dbResult.length > 0) {
            return dbResult[0];
        } else {
            return false;
        }
    });
};


/**
 * Modifying products in cart
 */
var modifyProductInCart = function (user_id, depot_id, quantity, variant_i) {
    var user_cart_info = "user_cart_info";
    if (quantity == 0) {
        return getCartProduct(user_id, depot_id).then(function (cart) {
            if (cart['id'] > 0) {
                var data = {
                    id: cart['id']
                };
                db.deleteQuery(user_cart_info, data).then(function (removed) {
                });
            }
        });
    } else {
        return getCartProduct(user_id, depot_id).then(function (cart) {
            if (cart['id'] > 0) {
                var data = {
                    quantity: quantity,
                    variant_i: variant_i
                };
                var key = {
                    id: cart['id']
                };
                db.updateQuery(user_cart_info, [data, key]).then(function (updated) {
                    return updated.id;
                });
            } else {
                var data = {
                    user_id: user_id,
                    depot_id: depot_id,
                    quantity: quantity,
                    variant_i: variant_i
                };
                db.insertQuery(user_cart_info, data).then(function (inserted) {
                    return inserted.id;
                });
            }
        });
    }

};

/**
 * Clear cart in database
 */
var clearCart = function (user_id) {
    var user_cart_info = "user_cart_info";
    var data = {
        user_id: user_id
    };
    return db.deleteQuery(user_cart_info, data).then(function (removed) {
        return removed;
    });
};

/**
 * Get users cart
 */
var getUserCart = function (user_id) {
    var sqlQuery = `SELECT 
                        usercart.user_id AS user_id, usercart.quantity AS quantity, usercart.variant_i AS variant_i,
                        depot.id AS depot_id, depot.product_id AS product_id,
                        listing.id AS listing_id, subcategory.name AS subcategory, type.name AS type,
                        listing.product_brand AS brand, listing.product_name AS name,
                        listing.product_description AS description, product.product_image AS image,
                        depot.price AS price, depot.quantity AS quantity, packaging.name AS packaging,
                        container.name AS container, volume.volume_name AS volume, category.name AS category
                    FROM 
                        catalog_depot AS depot, catalog_products AS product, catalog_listings AS listing,
                        catalog_categories AS category, catalog_types AS type, catalog_subcategories AS subcategory,
                        catalog_containers AS container, catalog_packagings AS packaging, catalog_packaging_volumes AS volume,
                        user_cart_info AS usercart
                    WHERE 
                        depot.product_id = product.id AND product.listing_id = listing.id AND depot.id = usercart.depot_id
                        AND type.id = listing.type_id AND type.subcategory_id = subcategory.id
                        AND container.id = product.container_id AND packaging.id = depot.packaging_id
                        AND depot.packaging_volume_id = volume.id AND category.id = subcategory.category_id AND ?
                    ORDER BY 
                        listing_id, product_id, depot_id`;
    var data = { "usercart.user_id": user_id };
    return db.runQuery(sqlQuery, data).then(function (dbResult) {
        return getFormattedProducts(dbResult);
    });
};

var convertArrayToObject = function (initialArray) {
    var result = {};
    var element;
    for (i = 0; i < initialArray.length; i++) {
        element = initialArray[i];
        result[element['depot_id']] = element;
    }
    return getFormattedProducts(initialArray);
};

// /**
//  * 
//  */
// var getFormattedProducts = function (products) {
//     var result = [];

//     var tmpDepotIds = [];
//     var tmpPackagings = [];
//     var tmpVolumes = [];
//     var tmpPricing = [];

//     var prevProduct;

//     var imageLocation;

//     for (i=0; i<products.length; i++) {
//         var canPush = false;
//         imageLocation = "/resources/images/products/"+products[i].category.toLowerCase()+"/";
//         if (i==0) {
//             prevProduct = products[i].product_id;
//             tmpDepotIds.push(products[i].depot_id);
//             tmpPackagings.push(products[i].packaging);
//             tmpVolumes.push(products[i].volume);
//             tmpPricing.push(products[i].price);
//         } else {
//             if (products[i].product_id == prevProduct) {
//                 tmpDepotIds.push(products[i].depot_id);
//                 tmpPackagings.push(products[i].packaging);
//                 tmpVolumes.push(products[i].volume);
//                 tmpPricing.push(products[i].price);                
//             } else {
//                 canPush = true;
//             }
//         }

//         if (canPush || i == products.length-1) {
//             // build tmp product
//             var tmpProduct = {
//                 product_id: products[i].product_id,
//                 depot_ids: tmpDepotIds,
//                 listing_id: products[i].listing_id,
//                 subcategory: products[i].subcategory,
//                 type: products[i].type,
//                 brand: products[i].brand,
//                 name: products[i].name,
//                 description: products[i].description,
//                 image: imageLocation+products[i].image,
//                 quantity: products[i].quantity,
//                 packagings: tmpPackagings,
//                 container: products[i].container,
//                 volumes: tmpVolumes,
//                 pricing: tmpPricing,
//                 category: products[i].category
//             };
//             // reset tmps
//             tmpDepotIds = [];
//             tmpPackagings = [];
//             tmpVolumes = [];
//             tmpPricing = [];
//             prevProduct = products[i].product_id;
//             tmpDepotIds.push(products[i].depot_id);
//             tmpPackagings.push(products[i].packaging);
//             tmpVolumes.push(products[i].volume);
//             tmpPricing.push(products[i].price);

//             result.push(tmpProduct);
//         }
//     }
//     return result;
// }

var getFormattedProducts = function (products) {
    var tmpResult = {};

    for (var i=0; i < products.length; i++){
        var product = products[i];
        var imageLocation = "/resources/images/products/"+product.category.toLowerCase()+"/";
        if (tmpResult.hasOwnProperty(product.listing_id)){
            // Add to product variant
            tmpResult[product.listing_id].product_variants.push({
                "depot_id": product.depot_id,
                "packaging": product.packaging,
                "volume": product.volume,
                "price": product.price
            });
        } else {
            // Add to tmpResult
            tmpResult[product.listing_id] = {
                product_id: products[i].product_id,
                listing_id: products[i].listing_id,
                subcategory: products[i].subcategory,
                type: products[i].type,
                brand: products[i].brand,
                name: products[i].name,
                i: products[i].variant_i,
                description: products[i].description,
                image: imageLocation+products[i].image,
                quantity: products[i].quantity,
                container: products[i].container,
                category: products[i].category,
                product_variants: [{
                    "depot_id": product.depot_id,
                    "packaging": product.packaging,
                    "volume": product.volume,
                    "price": product.price
                }]
            };
        }
    };

    // convert object of objects to array of objects
    var results = [];
    for (var r in tmpResult){
        if (tmpResult.hasOwnProperty(r)){
            results.push(tmpResult[r]);
        }
    };
    return results;
}

module.exports = router;