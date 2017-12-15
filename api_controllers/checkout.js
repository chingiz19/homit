/**
 * @copyright Homit 2017
 */

var router = require("express").Router();

router.post('/placeorder', function (req, res, next) {
    var email = req.body.user.email;
    var fname = req.body.user.fname;
    var lname = req.body.user.lname;
    var phone = req.body.user.phone;
    var address = req.body.user.address;
    var address_long = req.body.user.address_longitude;
    var address_lat = req.body.user.address_latitude;
    var birth_day = req.body.user.birth_day;
    var birth_month = req.body.user.birth_month;
    var birth_year = req.body.user.birth_year;
    var products = req.body.products;
    var transactionId = req.body.transaction_id;


    var signedUser = Auth.getSignedUser(req);
    if (signedUser != false) {
        var userId = signedUser.id;
        if (!products || !phone || !address || !address_lat || !address_long || !transactionId) {
            Logger.log("Missing params");
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
                        if (transactionDetails.transactions != undefined) {
                            Catalog.getTotalPriceForProducts(products).then(function (totalPrice) {
                                if (transactionDetails.transactions.transaction[0].amount >= totalPrice) {
                                    var data = {
                                        phone_number: phone
                                    };
                                    var key = {
                                        id: userId
                                    };
                                    User.updateUser(data, key).then(function (updatedUser) {
                                        if (updatedUser != false) {
                                            createOrders(userId, address, address_lat, address_long, false, transactionId, products).then(function (userOrders) {
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
                                        }
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
                                }
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
                        }

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
                }
            });
        }
    } else {
        if (!email || !phone || !fname || !lname || !address || !address_lat || !address_long || !products) {
            Logger.log("Missing params");
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
                        if (transactionDetails.transactions != undefined) {
                            Catalog.getTotalPriceForProducts(products).then(function (totalPrice) {
                                if (transactionDetails.transactions.transaction[0].amount >= totalPrice) {
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
                                                    createOrders(guestUserId, address, address_lat, address_long, true, transactionId, products).then(function (userOrders) {
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
                                                    createOrders(guestUserFound.id, address, address_lat, address_long, true, transactionId, products).then(function (userOrders) {
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
                                                }
                                            });
                                        }
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
                                }
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
                        }
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
                }
            });
        }
    }
});

var createOrders = function (id, address, address_lat, address_long, isGuest, transactionId, products) {
    var createFunctions = [];
    var userOrders = [];

    for (var superCategory in products) {
        createFunctions.push(Orders.createOrder(id, address, address_lat, address_long, isGuest, transactionId, superCategory));
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

            userOrders.push(userOrder);
            i++;
        }

        return userOrders;
    });

};

module.exports = router;