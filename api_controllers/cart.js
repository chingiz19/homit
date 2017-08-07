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
            var objectCart = convertArrayToObject(cart);
            var response = {
                success: true,
                cart: objectCart
            }
            res.send(response);
            console.log(respnse);
        });
    }
});

router.post('/modifyitem', function (req, res, next) {
    var warehouse_id = req.body.warehouse_id;
    var quantity = req.body.quantity;

    if (!req.session.user) {
        res.json({
            error: {
                code: "C001",
                "ui_message": "User is not signed in"
            }
        });
    } else {
        var user_id = req.session.user.id;
        modifyProductInCart(user_id, warehouse_id, quantity).then(function (result) {
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
 * Return quantity based on the user id, warehouse id provided
 */
var getCartProduct = function (user_id, warehouse_id) {
    var user_cart_info = "user_cart_info";
    var data1 = {
        user_id: user_id
    };
    var data2 = {
        warehouse_id: warehouse_id
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
var modifyProductInCart = function (user_id, warehouse_id, quantity) {
    var user_cart_info = "user_cart_info";
    if (quantity == 0) {
        return getCartProduct(user_id, warehouse_id).then(function (cart) {
            if (cart['id'] > 0) {
                var data = {
                    id: cart['id']
                };
                db.deleteQuery(user_cart_info, data).then(function (removed) {
                });
            }
        });
    } else {
        return getCartProduct(user_id, warehouse_id).then(function (cart) {
            if (cart['id'] > 0) {
                var data = {
                    quantity: quantity
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
                    warehouse_id: warehouse_id,
                    quantity: quantity
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
    var sqlQuery = `SELECT uc.user_id AS user_id, w.id AS warehouse_id, uc.quantity AS quantity, w.product_id AS product_id, s.name AS subcategory, 
            t.name AS type, pr.product_brand AS brand, pr.product_name AS name, pr.product_description AS description,
            pr.product_image AS image, w.price AS price, w.quantity AS warehouse_quantity, pa.name AS packaging, c.name AS category
            FROM catalog_warehouse AS w, catalog_packagings AS pa, catalog_products AS pr, catalog_types AS t,
            catalog_subcategories AS s, catalog_categories AS c, user_cart_info uc
            WHERE w.packaging_id = pa.id AND w.product_id = pr.id AND pr.type_id = t.id
            AND t.subcategory_id = s.id AND s.category_id = c.id AND w.id = uc.warehouse_id
            AND ?`;
    var data = { "uc.user_id": user_id };
    return db.runQuery(sqlQuery, data).then(function (dbResult) {
        return dbResult;
    });
};

var convertArrayToObject = function (initialArray) {
    var result = {};
    var element;
    for (i = 0; i < initialArray.length; i++) {
        element = initialArray[i];
        result[element['warehouse_id']] = element;
    }
    return result;
};

module.exports = router;