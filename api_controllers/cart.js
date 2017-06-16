var router = require("express").Router();
var db = require("../db.js");

router.get('/usercart', function(req, res, next){
    var user_id = req.query.user_id;
    getUserCart(user_id).then(function(cart) {
        res.send(cart);
    });

});

router.post('/addtocart', function(req, res, next){
    var user_id = req.session.user.id;
    var warehouse_id = req.body.warehouse_id;
    var quantity = req.body.quantity;
    var action = req.body.action;

    if (action == false) {
        removeProductToCart(user_id, warehouse_id, quantity).then(function(result) {
            var isSuccess;
            if (result!=false) {
                isSuccess = true;
            } else {
                isSuccess = false;
            }

            var response = {
                success: isSuccess
            };
            res.send(response);
        });
    } else {
        addProductToCart(user_id, warehouse_id, quantity).then(function(result) {
            var isSuccess;
            if (result!=false) {
                isSuccess = true;
            } else {
                isSuccess = false;
            }

            var response = {
                success: isSuccess
            };
            res.send(response);
        });
    }
});

router.post('/clear', function(req, res, next){
    var user_id = req.session.user.id;    
    if (user_id == null) {
        var response = {
            success: isSuccess
        };
        res.json({
            error: {
                code: "C001",
                "ui_message": "User is not signed in"
            }
        });
    } else {
        clearCart(user_id).then(function(result) {
            var isSuccess;
            if (result!=false) {
                isSuccess = true;
            } else {
                isSuccess = false;
            }
        });
        var response = {
            success: isSuccess
        };
        res.send(response);
    }
});


/**
 * Return quantity based on the user id, warehouse id provided
 */
var getCartProduct = function(user_id, warehouse_id) {
    var user_cart_info = "user_cart_info";    
    var data1 = {
        user_id: user_id
    };
    var data2 = {
        warehouse_id: warehouse_id
    };
    return db.selectQuery2(user_cart_info, [data1, data2]).then(function(dbResult) {
        if (dbResult.length>0) {
            return dbResult[0];
        } else {
            return false;
        }
    });
};


/**
 * Adds product to database
 */
var addProductToCart = function(user_id, warehouse_id, quantity) {
    var user_cart_info = "user_cart_info";
    return getCartProduct(user_id, warehouse_id).then(function(cart) {
        if (cart['id']>0) {
            var data = {
                quantity: cart['quantity']+quantity,
            };
            var key = {
                id: cart['id']
            };
            db.updateQuery(user_cart_info, [data, key]).then(function(updated){
                return updated.id;
            });   
        } else {
            var data = {
                user_id: user_id,
                warehouse_id: warehouse_id,
                quantity: quantity
            };
            db.insertQuery(user_cart_info, data).then(function(inserted) {
                return inserted.id;
            });
        }
    });
};


/**
 * Removes product to database
 */
var removeProductToCart = function(user_id, warehouse_id, quantity) {
    var user_cart_info = "user_cart_info";
    return getCartProduct(user_id, warehouse_id).then(function(cart) {
        if (cart['id']>0) {
            var data = {
                quantity: cart['quantity']-quantity,
            };
            var key = {
                id: cart['id']
            };
            db.updateQuery(user_cart_info, [data, key]).then(function(updated){
                return updated.id;
            });   
        } else {
            return false;
        }
    });
};

/**
 * Clear cart in database
 */
var clearCart = function(user_id) {
    var user_cart_info = "user_cart_info";
    var data = {
        user_id: user_id
    };
    db.deleteQuery(user_cart_info, data).then(function(removed){
        console.log("removoed");
    });
};

module.exports = router;