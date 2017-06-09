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

    console.log("add product API");
    console.log("user id is: " + user_id);
    console.log("warehouse id is: " + warehouse_id);
    console.log("quantity is: " + quantity);
    addProductToCart(user_id, warehouse_id, quantity).then(function(products) {
        var response = {
            success: true
        };
        res.send(response);
    });
});

router.post('/removeproduct', function(req, res, next){
    var response = {
        success: true
    };
    res.send(response);
});

router.post('/clear', function(req, res, next){
    var response = {
        success: true
    };
    res.send(response);
});


// /**
//  * Return user's cart based on the user id provided
//  */
// var getUserCart = function(user_id) {
//     var sqlQuery = `SELECT s.category_id = u.id AND ?`;
//     var data = {"u.id": user_id};
//     return db.runQuery(sqlQuery, data).then(function(dbResult) {
//         return dbResult;
//     });
// };

// /**
//  * Return user's cart id based on the user id provided
//  */
// var getUserCartId = function(user_id) {
//     var user_cart = "user_cart";
//     var data = {user_id: user_id};
//     return db.selectQuery(user_cart, data).then(function(dbResult) {
//         if (dbResult.length>0) {
//             return dbResult[0];
//         } else {
//             return false;
//         }
//     });
// };

// /**
//  * Return quantity based on the cart id, warehouse id provided
//  */
// var getCartProductQuantity = function(cart_id, warehouse_id) {
//     var cart_info = "cart_info";
//     var data = {
//         id: cart_id,
//         warehouse_id: warehouse_id
//     };
//     return db.selectQuery(cart_info, data).then(function(dbResult) {
//         if (dbResult.length>0) {
//             return dbResult[0];
//         } else {
//             return false;
//         }
//     });
// };

/**
 * Return quantity based on the user id, warehouse id provided
 */
var getCartProduct = function(user_id, warehouse_id) {
    console.log("getCartProduct");
    
    var user_cart_info = "user_cart_info";    
    
    var data1 = {
        user_id: user_id
    };

    var data2 = {
        warehouse_id: warehouse_id
    };

    return db.selectQuery2(user_cart_info, [data1, data2]).then(function(dbResult) {
        if (dbResult.length>0) {
            console.log("dbresult: " + dbResult);
            return dbResult[0];
        } else {
            console.log("false");
            return false;
        }
    });
};


/**
 *
 */
var addProductToCart = function(user_id, warehouse_id, quantity) {
    var user_cart_info = "user_cart_info";
    return getCartProduct(user_id, warehouse_id).then(function(cart) {
        if (cart['id']>0) {
            var data = {
                quantity: cart['quantity']+quantity,
                id: cart['id']
            };
            db.updateQuery(user_cart_info, data).then(function(updated){
                console.log("data updated");
            });   
        } else {
            var data = {
                user_id: user_id,
                warehouse_id: warehouse_id,
                quantity: quantity
            };
            db.insertQuery(user_cart_info, data).then(function(inserted) {
                console.log("inserted");
            });
        }
    });
};

    // getUserCartId(user_id).then(function(cart_id) {
    //     // if user has cart
    //     if (cart_id>0) {
    //         getCartProductQuantity(cart_id, warehouse_id).then(function(dbQuantity) {
    //             // if product is in cart
    //             if (dbQuantity>0) {
    //                 // change quantity
    //                 var data = {
    //                     quantity: dbQuantity+quantity,
    //                     warehouse_id: warehouse_id
    //                 };
    //                 db.updateQuery(cart_info, data).then(function(updated){

    //                 });   

    //             } else {
    //                 // insert product
    //                 var data = {
    //                     warehouse_id: warehouse_id,
    //                     quantity: quantity
    //                 };
    //                 db.insertQuery(cart_info, data).then(function(dbResult) {

    //                 });
    //             }
    //         });

    //     } else {         
    //         // insert cart for user
    //         var data = {
    //             warehouse_id: warehouse_id,
    //             quantity: quantity
    //         };
    //         db.insertQuery(cart_info, data).then(function(dbResult) {
    //             // insert product in cart
    //             var data = {
    //                 user_id: user_id,
    //                 cart_id: dbResult['cart_id']
    //             };
    //             db.insertQuery(user_cart, data).then(function(dbResult) {

    //             });
    //         });
            
    //     }

    // });

// };


module.exports = router;