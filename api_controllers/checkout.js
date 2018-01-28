/**
 * @copyright Homit 2018
 */

var router = require("express").Router();

/* Building metadata for log */
var metaData = {
    directory: __filename
}

router.post('/placeorder', function (req, res, next) {
    var email = req.body.user.email;
    var fname = req.body.user.fname;
    var lname = req.body.user.lname;
    var phone = req.body.user.phone;
    var address = req.body.user.address;
    var address_long = req.body.user.address_longitude;
    var address_lat = req.body.user.address_latitude;
    var driverInstruction = req.body.user.driver_instruction;
    var birth_day = req.body.user.birth_day;
    var birth_month = req.body.user.birth_month;
    var birth_year = req.body.user.birth_year;
    var cartProducts = req.body.products;
    var transactionId = req.body.transaction_id;
    var saveCard = req.body.save_card;
    var cardToken = req.body.card_token;
    var cardDigits = req.body.card_digits;
    var cardType = req.body.card_type;


    var signedUser = Auth.getSignedUser(req);
    if (signedUser != false) {
        var userId = signedUser.id;
        var cardValid = true;
        if (saveCard) {
            cardValid = !cardToken || !cardDigits || !cardType;
        }
        if (!cartProducts || !phone || !address || !address_lat || !address_long || !transactionId || !cardValid) {
            res.status(403).json({
                error: {
                    "code": "U000",
                    "dev_message": "Missing params",
                    "required_params": ["phone", "address", "address_latitude", "address_longitude", "products", "transactionId"]
                }
            });
        } else {
            Orders.checkTransaction(transactionId).then(function (isTransactionFine) {
                if (isTransactionFine) {
                    MP.getTransaction(transactionId, function (transactionDetails) {
                        if (transactionDetails != 'empty' && transactionDetails.transactions != undefined) {
                            Catalog.getCartProducts(cartProducts).then(function (dbProducts) {
                                var products = Catalog.getCartProductsWithSuperCategory(cartProducts, dbProducts);
                                var totalPrice = Catalog.getTotalPriceForProducts(cartProducts, dbProducts);
                                var transactionValid = MP.validateTransaction(transactionDetails, totalPrice);
                                if (transactionValid) {
                                    var data = {
                                        phone_number: phone
                                    };
                                    if (birth_year && birth_month && birth_day) {
                                        var birth_date = birth_year + "-" + birth_month + "-" + birth_day;
                                        data.birth_date = birth_date;
                                    }
                                    var key = {
                                        id: userId
                                    };
                                    User.updateUser(data, key).then(function (updatedUser) {
                                        if (updatedUser != false) {
                                            saveCreditCard(key, saveCard, cardToken, cardDigits, cardType).then(function (savedCard) {
                                                createOrders(userId, address, address_lat, address_long, driverInstruction, false, transactionId, products).then(function (userOrders) {
                                                    var response = {
                                                        success: true,
                                                        orders: userOrders
                                                    };
                                                    res.send(response);
                                                });
                                            });
                                        } else {
                                            var response = {
                                                success: false,
                                                error: {
                                                    dev_message: "Something went wrong while updating the user",
                                                    ui_message: "Error happened while checkout. Please try again"
                                                }
                                            };
                                            res.send(response);
                                            Logger.log.warn("Something went wrong while updating the user (USER)", metaData);
                                        }
                                    });
                                } else {
                                    var response = {
                                        success: false,
                                        error: {
                                            dev_message: "Paid and claimed amount does not match",
                                            ui_message: "Error happened while checkout. Please try again"
                                        }
                                    };
                                    res.send(response);
                                    var specMetaData = {
                                        directory: __filename,
                                        requester_ip: req.connection.remoteAddress,
                                        user_id: userId
                                    }
                                    Logger.log.warn("Paid and claimed amount does not match (USER)", specMetaData);
                                }
                            });
                        } else {
                            var response = {
                                success: false,
                                error: {
                                    dev_message: "Could not get transaction details from Helcim",
                                    ui_message: "Error happened while checkout. Please try again"
                                }
                            };
                            res.send(response);
                            Logger.log.error("Could not get transaction details from Helcim (USER)", metaData);
                        }
                    });
                } else {
                    var response = {
                        success: false,
                        error: {
                            dev_message: "Transaction ID already exists in database",
                            ui_message: "Error happened while checkout. Please try again"
                        }
                    };
                    res.send(response);
                    Logger.log.warn("Transaction ID already exists in database (USER)", metaData);
                }
            });
        }
    } else {
        if (!email || !phone || !fname || !lname || !address || !address_lat || !address_long || !cartProducts || !transactionId) {
            res.status(403).json({
                error: {
                    "code": "U000",
                    "dev_message": "Missing params",
                    "required_params": ["email", "phone", "fname", "lname", "address", "address_lat", "address_long", "products"]
                }
            });
        } else {
            Orders.checkTransaction(transactionId).then(function (isTransactionFine) {
                if (isTransactionFine) {
                    MP.getTransaction(transactionId, function (transactionDetails) {
                        if (transactionDetails != 'empty' && transactionDetails.transactions != undefined) {
                            Catalog.getCartProducts(cartProducts).then(function (dbProducts) {
                                var products = Catalog.getCartProductsWithSuperCategory(cartProducts, dbProducts);
                                var totalPrice = Catalog.getTotalPriceForProducts(cartProducts, dbProducts);
                                var transactionValid = MP.validateTransaction(transactionDetails, totalPrice);
                                if (transactionValid) {
                                    User.findGuestUser(email).then(function (guestUserFound) {
                                        if (guestUserFound == false) {
                                            var data = {
                                                user_email: email,
                                                first_name: fname,
                                                last_name: lname,
                                                phone_number: phone
                                            };
                                            if (birth_year && birth_month && birth_day) {
                                                var birth_date = birth_year + "-" + birth_month + "-" + birth_day;
                                                data.birth_date = birth_date;
                                            }
                                            User.addGuestUser(data).then(function (guestUserId) {
                                                if (guestUserId != false) {
                                                    createOrders(guestUserId, address, address_lat, address_long, driverInstruction, true, transactionId, products).then(function (userOrders) {
                                                        var response = {
                                                            success: true,
                                                            orders: userOrders
                                                        };
                                                        res.send(response);
                                                    });
                                                } else {
                                                    var response = {
                                                        success: false,
                                                        error: {
                                                            dev_message: "Something went wrong while adding the user",
                                                            ui_message: "Error happened while checkout. Please try again"
                                                        }
                                                    };
                                                    res.send(response);
                                                    Logger.log.error("Something went wrong while adding the user (GUEST)", metaData);
                                                }
                                            });
                                        } else {
                                            var data = {
                                                first_name: fname,
                                                last_name: lname,
                                                phone_number: phone
                                            };
                                            if (birth_year && birth_month && birth_day) {
                                                var birth_date = birth_year + "-" + birth_month + "-" + birth_day;
                                                data.birth_date = birth_date;
                                            }
                                            var key = {
                                                id: guestUserFound.id
                                            };
                                            User.updateGuestUser(data, key).then(function (guestUser) {
                                                if (guestUser != false) {
                                                    createOrders(guestUserFound.id, address, address_lat, address_long, driverInstruction, true, transactionId, products).then(function (userOrders) {
                                                        var response = {
                                                            success: true,
                                                            orders: userOrders
                                                        };
                                                        res.send(response);
                                                    });
                                                } else {
                                                    var response = {
                                                        success: false,
                                                        error: {
                                                            dev_message: "Something went wrong while updating the user",
                                                            ui_message: "Error happened while checkout. Please try again"
                                                        }
                                                    };
                                                    res.send(response);
                                                    Logger.log.error("Something went wrong while adding the user (GUEST)", metaData);
                                                }
                                            });
                                        }
                                    });
                                } else {
                                    var response = {
                                        success: false,
                                        error: {
                                            dev_message: "Paid and claimed amount does not match",
                                            ui_message: "Error happened while checkout. Please try again"
                                        }
                                    };
                                    res.send(response);
                                    var specMetaData = {
                                        directory: __filename,
                                        requester_ip: req.connection.remoteAddress
                                    }
                                    Logger.log.warn("Paid and claimed amount does not match (GUEST)", specMetaData);
                                }
                            });
                        } else {
                            var response = {
                                success: false,
                                error: {
                                    dev_message: "Could not get transaction details from Helcim",
                                    ui_message: "Error happened while checkout. Please try again"
                                }
                            };
                            res.send(response);
                            Logger.log.error("Could not get transaction details from Helcim (GUEST)", metaData);
                        }
                    });
                } else {
                    var response = {
                        success: false,
                        error: {
                            dev_message: "Transaction ID already exists in database",
                            ui_message: "Error happened while checkout. Please try again"
                        }
                    };
                    res.send(response);
                    Logger.log.warn("Transaction ID already exists in database (GUEST)", metaData);
                }
            });
        }
    }
});

var createOrders = function (id, address, address_lat, address_long, driverInstruction, isGuest, transactionId, products) {
    var createFunctions = [];
    var userOrders = [];

    for (var superCategory in products) {
        createFunctions.push(Orders.createOrder(id, address, address_lat, address_long, driverInstruction, isGuest, transactionId, superCategory));
    }

    return Promise.all(createFunctions).then(function (orderIds) {
        var i = 0;
        for (var superCategory in products) {
            var inserted = Orders.insertProducts(orderIds[i], products[superCategory]);
            var userOrder = {
                super_category: superCategory,
                order_id: orderIds[i]
            };

            var cmUserId = "";
            var cmOrderId = "o_" + userOrder.order_id;
            if (isGuest) {
                cmUserId = "g_" + id;
            } else {
                cmUserId = "u_" + id;
            }
            CM.sendOrder(cmUserId, address, cmOrderId, superCategory);
            SMS.alertDirectors("\u1F6A9 Order placed, ID: " + cmOrderId);
            userOrders.push(userOrder);
            i++;
        }
        return userOrders;
    });

};

var saveCreditCard = async function (userKey, saveCard, cardToken, cardDigits, cardType) {
    if (saveCard) {
        return User.updateCreditCard(userKey, cardToken, cardDigits, cardType).then(function (cardUpdated) {
            return cardUpdated;
        });
    } else {
        return true;
    }
};

module.exports = router;