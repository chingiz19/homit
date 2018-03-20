/**
 * @copyright Homit 2018
 */

var router = require("express").Router();

router.post('/findusersbyphone', async function (req, res, next) {
    var phoneNumber = req.body.phone_number;
    if (phoneNumber) {
        var users = await Orders.getUsersByOrderPhone(phoneNumber);
        var guests = await Orders.getGuestsByOrderPhone(phoneNumber);
        users = users.concat(guests);

        var response = {
            success: true,
            users: users
        };
        res.send(response);
    } else {
        return errorMessages.sendMissingParams(res, ["phone_number"]);
    }
});

router.post('/findusersbyemail', async function (req, res, next) {
    var email = req.body.user_email;
    if (email) {
        var users = await User.findUsersByEmailWithHistory(email);
        var guests = await User.findGuestUsersByEmail(email);
        users = users.concat(guests);
        var response = {
            success: true,
            users: users
        };
        res.send(response);
    } else {
        return errorMessages.sendMissingParams(res, ["user_email"]);
    }
});

router.post('/finduserbyorderid', Auth.validateCsr(), async function (req, res, next) {
    var orderId = req.body.order_id;
    if (orderId) {
        var result = await Orders.getUserWithOrderByOrderId(orderId);
        if (result) {
            res.json({
                success: true,
                user: result.user
            });
        } else {
            res.json({
                success: false
            });
        }
    } else {
        return errorMessages.sendMissingParams(res, ["order_id"]);
    }
});

router.post('/viewordertransactions', Auth.validateCsr(), async function (req, res, next) {
    var userId = req.body.user_id;
    var guestId = req.body.guest_id;

    if (!userId && !guestId) {
        return errorMessages.sendMissingParams(res, ["user_id", "guest_id"]);
    } else {
        var data;
        if (!userId) {
            data = await Orders.getOrderTransactionsByGuestId(guestId);
        } else {
            data = await Orders.getOrderTransactionsByUserId(userId);
        }

        res.json({
            success: true,
            transactions: data
        });
    }
});

router.post('/vieworders', Auth.validateCsr(), async function (req, res, next) {
    var orderTransactionId = req.body.transaction_id;
    if (!orderTransactionId) {
        return errorMessages.sendMissingParams(res, ["transaction_id"]);
    } else {
        var data = await Orders.getOrdersByTransactionId(orderTransactionId);
        res.json({
            success: true,
            orders: data
        });
    }
});

router.post('/getorder', Auth.validateCsr(), async function (req, res, next) {
    var orderId = req.body.order_id;
    if (!orderId) {
        return errorMessages.sendMissingParams(res, ["order_id"]);
    } else {
        var data = await Orders.getOrderItemsById(orderId);
        res.json({
            success: true,
            order: data
        });
    }
});

router.get('/pendingorders', Auth.validateCsr(), async function (req, res, next) {
    var pendingOrders = await Orders.getPendingOrders();
    res.json({
        success: true,
        orders: pendingOrders
    });
});

router.get('/activedrivers', Auth.validateCsr(), function (req, res, next) {
    Driver.getActiveDrivers().then(function (activeDrivers) {
        res.json({
            success: true,
            drivers: activeDrivers
        });
    });
});

router.post('/getdriverroutes', Auth.validateCsr(), function (req, res, next) {
    var driverId = req.body.driver_id;
    Driver.getRoutes(driverId).then(function (routes) {
        res.json({
            success: true,
            routes: routes
        });
    });
});

/* View logs from CSR's browser */
router.post('/streamlog', Auth.validateCsr(), function (req, res, next) {
    Logger.stream(res);
});

// these methods are old, they need to be revisited

router.post('/refundorder', Auth.validateCsr(), function (req, res, next) {
    var orderId = req.body.order_id;
    var note = req.body.note;
    var dateScheduled = req.body.date_scheduled;
    var dateScheduledNote = req.body.date_scheduled_note;
    var csrId = Auth.getSignedUser(req).id;

    Orders.isDelivered(orderId).then(function (delivered) {
        if (delivered) {
            CSR.recordAction(csrId, note).then(function (csrActionId) {
                Orders.placeRefundHistory(orderId, csrActionId, dateScheduled, dateScheduledNote).then(function (refundHistoryId) {
                    Orders.placeFullRefundCart(orderId).then(function (oldItems) {
                        Orders.getUserWithOrderByOrderId(orderId).then(function (orderInfoResult) {
                            Orders.calculateModifiedAmount(orderId, oldItems, true).then(function (refundAmount) {
                                var customerRefundAmount = refundAmount.cart_amount;
                                var customerRefundTax = refundAmount.total_tax;
                                var customerRefundTotal = refundAmount.total_price;
                                Orders.updateRefundAmount(refundHistoryId, customerRefundTotal).then(function (refundUpdated) {
                                    var orderEmailInfo = {
                                        customer_email: orderInfoResult.user.user_email,
                                        customer_name: orderInfoResult.user.first_name,
                                        order_id: orderId,
                                        refund_amount: customerRefundTotal
                                    };

                                    Email.sendRefundEmail(orderEmailInfo);
                                    var response = {
                                        success: true,
                                        message: "Please refund user's order."
                                    };
                                    res.send(response);
                                });
                            });
                        });
                    });
                });
            });
        } else {
            var response = {
                success: false,
                message: "Order has not been delivered. You cannot refund non-delivered order. Please use cancel order."
            };
            res.send(response);
        }
    });
});

router.post('/cancelorder', Auth.validateCsr(), function (req, res, next) {
    var orderId = req.body.order_id;
    var note = req.body.note;
    var csrId = Auth.getSignedUser(req).id;

    Orders.isDelivered(orderId).then(function (delivered) {
        if (!delivered) {
            // Putting CSR action
            CSR.recordAction(csrId, note).then(function (csrActionId) {

                Orders.placeCancelHistory(orderId, csrActionId).then(function (cancelHistoryId) {
                    Orders.placeFullRefundCart(orderId).then(function (oldItems) {
                        Orders.getUserWithOrderByOrderId(orderId).then(function (orderInfoResult) {
                            Orders.calculateModifiedAmount(orderId, oldItems, false).then(function (refundAmount) {
                                var customerRefundAmount = refundAmount.cart_amount;
                                var customerRefundTax = refundAmount.total_tax;
                                var customerRefundDelivery = refundAmount.delivery_fee;
                                var customerRefundTotal = refundAmount.total_price;
                                CM.cancelOrder(orderId, orderInfoResult.order.driver_id);
                                Driver.cancelOrder(orderId, orderInfoResult.order.driver_id);

                                Orders.updateCancelAmount(cancelHistoryId, customerRefundTotal).then(function (refundUpdated) {
                                    var orderEmailInfo = {
                                        customer_email: orderInfoResult.user.user_email,
                                        customer_name: orderInfoResult.user.first_name,
                                        order_id: orderId,
                                        refund_amount: customerRefundTotal
                                    };

                                    Email.sendCancelEmail(orderEmailInfo);
                                    var response = {
                                        amount: customerRefundTotal,
                                        success: true,
                                        message: "Please refund user's order."
                                    };
                                    res.send(response);
                                });
                            });
                        });
                    });
                });
            });
        } else {
            // Cannot refund non delivered order
            var response = {
                success: false,
                message: "Order has been delivered. You cannot cancel delivered order. Please use refund order."
            };
            res.send(response);
        }
    });
});

router.post('/refunditems', Auth.validateCsr(), function (req, res, next) {
    var orderId = req.body.order_id;
    var refundItems = req.body.items;
    var note = req.body.note;
    var dateScheduled = req.body.date_scheduled;
    var dateScheduledNote = req.body.date_scheduled_note;
    var csrId = Auth.getSignedUser(req).id;

    Orders.isDelivered(orderId).then(function (delivered) {
        if (delivered) {
            CSR.recordAction(csrId, note).then(function (csrActionId) {
                Orders.placeRefundHistory(orderId, csrActionId, dateScheduled, dateScheduledNote).then(function (refundHistoryId) {
                    Orders.placePartialRefundCart(orderId, refundItems).then(function (oldItems) {
                        if (oldItems) {
                            Orders.getUserWithOrderByOrderId(orderId).then(function (orderInfoResult) {

                                Orders.calculateModifiedAmount(orderId, oldItems, true).then(function (refundAmount) {
                                    var customerRefundAmount = refundAmount.cart_amount;
                                    var customerRefundTax = refundAmount.total_tax;
                                    var customerRefundTotal = refundAmount.total_price;

                                    Orders.updateRefundAmount(refundHistoryId, customerRefundTotal).then(function (refundUpdated) {
                                        var orderEmailInfo = {
                                            customer_email: orderInfoResult.user.user_email,
                                            customer_name: orderInfoResult.user.first_name,
                                            order_id: orderId,
                                            refund_amount: customerRefundTotal
                                        };

                                        Email.sendRefundEmail(orderEmailInfo);
                                        var response = {
                                            success: true,
                                            message: "Please refund user's order."
                                        };
                                        res.send(response);
                                    });
                                });
                            });
                        } else {
                            var response = {
                                success: false,
                                message: "Something is really wrong."
                            };
                            res.send(response);
                            var metaData = {
                                directory: __filename
                            }
                            Logger.log.warn("Delivered items don't match requested, by CSR, items", metaData);
                        }
                    });
                });
            });
        } else {
            // Cannot refund non delivered order
            var response = {
                success: false,
                message: "Order has not been delivered. You cannot refund non-delivered order. Please use cancel order."
            };
            res.send(response);
        }
    });
});

router.post('/cancelitems', Auth.validateCsr(), function (req, res, next) {
    var orderId = req.body.order_id;
    var cancelItems = req.body.items;
    var note = req.body.note;
    var csrId = Auth.getSignedUser(req).id;

    Orders.isDelivered(orderId).then(function (delivered) {
        if (!delivered) {
            CSR.recordAction(csrId, note).then(function (csrActionId) {
                Orders.placeCancelHistory(orderId, csrActionId).then(function (cancelHistoryId) {
                    Orders.placePartialRefundCart(orderId, cancelItems).then(function (oldItems) {
                        Orders.getUserWithOrderByOrderId(orderId).then(function (orderInfoResult) {
                            Orders.calculatePartialCancelAmount(orderId, oldItems, false).then(function (refundAmount) {
                                var customerRefundAmount = refundAmount.cart_amount;
                                var customerRefundTax = refundAmount.total_tax;
                                var customerRefundTotal = refundAmount.total_price;
                                Orders.updateCancelAmount(cancelHistoryId, customerRefundTotal).then(function (refundUpdated) {
                                    Drivers.findDriverById(orderInfoResult.order.driver_id).then(function (driver) {
                                        var orderEmailInfo = {
                                            customer_email: orderInfoResult.user.user_email,
                                            customer_name: orderInfoResult.user.first_name,
                                            order_id: orderId,
                                            refund_amount: customerRefundTotal
                                        };
                                        Email.sendCancelEmail(orderEmailInfo);

                                        Catalog.getCartProductsWithInfo(cancelItems).then(function (cancelItemsWithInfo) {
                                            var message = "Please do not deliver following items: \n";
                                            SMS.notifyDriver(message, driver.first_name, driver.phone_number, function (response) {
                                                if (!response) {
                                                    Logger.log.warn("Could NOT send notification sms to " + driver.first_name + " " + driver.last_name
                                                        + "(DRIVER) to cancel item(s) delivery in order(ID: " + orderId + ")");
                                                }
                                            });

                                            var response = {
                                                success: true,
                                                message: "Please refund user's order."
                                            };
                                            res.send(response);
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        } else {
            var response = {
                success: false,
                message: "Order has been delivered. You cannot cancel delivered order. Please use refund order."
            };
            res.send(response);
        }
    });
});

router.post('/additems', Auth.validateCsr(), function (req, res, next) {
    var orderId = req.body.order_id;
    var note = req.body.note;
    var csrId = Auth.getSignedUser(req).id;
    var cartProducts = req.body.products;
    var transactionId = req.body.transaction_id;
    var driverInstruction = req.body.driver_instruction;

    CSR.recordAction(csrId, note).then(function (csrActionId) {
        Orders.getOrderInfo(orderId).then(function (orderInfo) {
            var userId;
            var isGuest;
            if (orderInfo.user_id) {
                userId = orderInfo.user_id;
                isGuest = false;
            } else {
                userId = orderInfo.guest_id;
                isGuest = true;
            }
            Catalog.getCartProducts(cartProducts).then(function (dbProducts) {
                var products = Catalog.getCartProductsWithSuperCategory(cartProducts, dbProducts);
                var productKeys = Object.keys(products);
                var superCategory = productKeys[0];

                MP.getTransaction(transactionId, function (transactionDetails) {
                    if (transactionDetails != 'empty' && transactionDetails.transactions != undefined) {
                        var cardDigits = MP.getUserCardLastDigits(transactionDetails);

                        Orders.createOrder(userId, orderInfo.delivery_address, orderInfo.delivery_latitude, orderInfo.delivery_longitude, driverInstruction, isGuest, transactionId, cardDigits, superCategory).then(function (orderId) {
                            var inserted = Orders.insertProducts(orderId, products[superCategory]);
                            var userOrder = {
                                super_category: superCategory,
                                order_id: orderId
                            };

                            var cmUserId = "";
                            var cmOrderId = "o_" + userOrder.order_id;
                            if (isGuest) {
                                cmUserId = "g_" + userId;
                            } else {
                                cmUserId = "u_" + userId;
                            }
                            CM.sendOrder(cmUserId, orderInfo.delivery_address, cmOrderId, superCategory);

                            Catalog.getTotalPriceForProducts(products).then(function (price) {
                                Orders.placeAddHistory(orderId, csrActionId, price.total_price).then(function (addHistoryId) {
                                    var response = {
                                        success: true,
                                        order: userOrder,
                                        message: "Order has been placed."
                                    };
                                    res.send(response);
                                });
                            });
                        });
                    } else {
                        //TODO Logger
                    }
                });
            });
        });
    });
});

module.exports = router;
