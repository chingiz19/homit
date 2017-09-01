/**
 * This class will provide backend APIs for checkout.
 * 
 * @author Zaman Zamanli
 * @copyright Homit
 */

var router = require("express").Router();

var users_customers = "users_customers";
var users_customers_all = "users_customers_all";
var users_customers_guest = "users_customers_guest";
var orders_cart_info = "orders_cart_info";
var orders_info = "orders_info";

router.post('/placeorder', function(req, res, next) {
    //TODO: Add support for Date of Birth (body.dob)
    var email = req.body.userInfo.email;    
    var fname = req.body.userInfo.fname;
    var lname = req.body.userInfo.lname;
    var phone = req.body.userInfo.phone;
    var address = req.body.userInfo.address;

    var products = req.body.products;

    if (!email || !products || !address) {
        res.status(403).json({
            error: {
                "code": "U000",
                "dev_message": "Missing params",
                "required_params": ["email", "address", "products"]
            }
        }); 
    }

    if (!req.session.user) {
        if (!phone || !fname || !lname || !address) {
            res.status(403).json({
                error: {
                    "code": "U000",
                    "dev_message": "Missing params",
                    "required_params": ["phone", "fname", "lname", "address"]
                }
            }); 
        }
        getGuestUserAllId(email, fname, lname, phone).then(function(resultId) {
            insertOrders(resultId, address, products).then(function(success){
                if (success) {
                    var response = {
                        success: true
                    };
                    res.send(response);
                } else {
                    res.status(500).json({
                        error: {
                            "dev_message": "Something went wrong"
                        }
                    }); 
                }
            });
        });
    } else {
        getSignedUserAllId(req.session.user.id).then(function(resultId) {
            insertOrders(resultId, address, products).then(function(success){
                clearCart(req.session.user.id).then(function(cartCleared) {
                    if (success) {
                        var response = {
                            success: true
                        };
                        res.send(response);
                    } else {
                        res.status(500).json({
                            error: {
                                "dev_message": "Something went wrong"
                            }
                        }); 
                    }
                });
                               
            });
        });
    }


});

/**
 * Inserts orders into DB
 * 
 * @param {Number} user_id 
 * @param {String} delivery_address 
 * @param {Array} products
 * 
 * @return {Boolean} 
 */
var insertOrders = function(user_id, delivery_address, products) {
    return insertOrdersInfo(user_id, delivery_address).then(function(orderId) {
        for (var i=0; i < products.length; i++){
            insertCartInfo(orderId, products[i].depot_id, products[i].quantity).then(function(cartInfoResult) {
                if (!cartInfoResult) {
                    return false;
                }
            });
        }
        return true;
    });
};

/**
 * Inserts cart info
 * 
 * @param {Number} orderId 
 * @param {Number} depotId 
 * @param {Number} quantity
 * 
 * @return {Number} id 
 */
var insertCartInfo = function(orderId, depotId, quantity) {
    var data = {
        "depot_id": depotId,
        "quantity": quantity,
        "order_id": orderId
    };
    return db.insertQuery(orders_cart_info, data).then(function(dbResult) {
        return dbResult.insertId;
    });
};

/**
 * Inserts orders info
 * 
 * @param {Number} user_id 
 * @param {String} delivery_address 
 * 
 * @return {Number} id
 */
var insertOrdersInfo = function(user_id, delivery_address) {
    var data = {
        user_id: user_id,
        delivery_address: delivery_address
    };
    return db.insertQuery(orders_info, data).then(function(dbResult) {
        return dbResult.insertId;
    });
};

/**
 * Get user id from all users for guest user
 * 
 * @param {String} email 
 * @param {String} fname 
 * @param {String} lname 
 * @param {String} phone
 * 
 * @return {Number} id 
 */
var getGuestUserAllId = function(email, fname, lname, phone) {
    return userExistsInGuest(email).then(function(existsGuest) {
        if (existsGuest) {
            return updateGuestInfo(existsGuest, fname, lname, phone).then(function(existsGuest) {
                console.log("2. existsGuest: "+existsGuest);        
                return userExistsInAll(existsGuest).then(function(existsAll) {
                    if (existsAll) {
                        return existsAll;
                    } else {
                        return insertUsersAll(existsGuest, true).then(function(userAllId) {
                            return userAllId;
                        });
                    }
                });
            });
        } else {
            return insertGuestUser(email, fname, lname, phone).then(function(guestId) {
                return insertUserAllId(guestId, true).then(function(userAllId) {
                    return userAllId;
                });
            });
        }
    });
};

/**
 * Get user id from all users for signed user
 * 
 * @param {Number} id
 * 
 * @return {Number} id 
 */
var getSignedUserAllId = function(id) {
    console.log("getSignedUserAllId " + id);
    return userExistsInAll(id, false).then(function(existsAll) {
        if (existsAll) {
            return existsAll;
        } else {
            return insertUsersAll(id, false).then(function(existsAll) {
                return existsAll;
            });
        }
    });
};

/**
 * Updates user info in guest users table
 * 
 * @param {Number} id 
 * @param {String} fname 
 * @param {String} lname 
 * @param {String} phone
 * 
 * @return {Number} id 
 */
var updateGuestInfo = function(id, fname, lname, phone) {
    var data = {
        first_name: fname,
        last_name: lname,
        phone_number: phone
    };
    var key = {
        id: id
    };
    return db.updateQuery(users_customers_guest, [data, key]).then(function(updated) {
        if (!updated) {
            return false;
        }
        return id;
    });
};

/**
 * Inserts user into guest users table
 * 
 * @param {String} email 
 * @param {String} fname 
 * @param {String} lname 
 * @param {String} phone 
 * 
 * @return {Number} id
 */
var insertGuestUser = function(email, fname, lname, phone) {
    var data = {
        user_email: email,
        first_name: fname,
        last_name: lname,
        phone_number: phone
    };
    return db.insertQuery(users_customers_guest, data).then(function(dbResult) {
        return dbResult.insertId;
    });
};

/**
 * Insers user into all users table
 * 
 * @param {String} uId 
 * @param {Boolean} isGuest
 * 
 * @return {Number} id 
 */
var insertUsersAll = function(uId, isGuest) {
    var data;
    if (isGuest) {
        data = {
            guest_user_id: uId
        };
    } else {
        data = {
            user_id: uId
        };
    }
    return db.insertQuery(users_customers_all, data).then(function(dbResult) {
        return dbResult.insertId;
    });
};

/**
 * Checks if user exists in actual users table
 * 
 * @param {String} email
 * 
 * @return {id} id 
 */
var userExistsInActual = function(email) {
    return userExists(users_customers, email).then(function(id){
        return id;
    });
};

/**
 * Checks if user exists in guest users table
 * 
 * @param {String} email
 * 
 * @return {Number} id 
 */
var userExistsInGuest = function(email) {
    return userExists(users_customers_guest, email).then(function(id) {
        return id;
    });
};

/**
 * Checks if user exists in all users table
 * 
 * @param {Number} userId 
 * @param {Boolean} isGuest 
 * 
 * @return {Number} id
 */
var userExistsInAll = function(userId, isGuest) {
    var data;
    if (isGuest) {
        data = {guest_user_id: userId};
    } else {
        data = {user_id: userId};
    }
    return db.selectQuery(users_customers_all, data).then(function(dbResult) {
        if (dbResult.length>0) {
            return dbResult[0];
        } else {
            return false;
        }
    });
};

/**
 * Checks if the user exists in the table
 * 
 * @param {String} table 
 * @param {String} email 
 * 
 * @return {Number} id
 */
var userExists = function(table, email) {
    var data = {user_email: email};
    return db.selectQuery(table, data).then(function(dbResult) {
        if (dbResult.length>0) {
            return dbResult[0].id;
        } else {
            return false;
        }
    });
};


/**
 * Clear cart in database
 * 
 * @param {Number} user_id
 * 
 * @return {Boolean}
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

module.exports = router;