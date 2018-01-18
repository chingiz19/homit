/**
 * @copyright Homit 2017
 */

var router = require("express").Router();

router.post('/refundorder', Auth.validateCsr(), function (req, res, next) {
    // router.post('/refundorder', function (req, res, next) {
    var orderId = req.body.order_id;
    var note = req.body.note;
    var dateScheduled = req.body.date_scheduled;
    var dateScheduledNote = req.body.date_scheduled_note;
    var csrId = Auth.getSignedUser(req).id;
    // var csrId = 1;

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
            // Cannot refund non delivered order
            var response = {
                success: false,
                message: "Order has not been delivered. You cannot refund non-delivered order. Please use cancel order."
            };
            res.send(response);
        }
    });
});

router.post('/cancelorder', Auth.validateCsr(), function (req, res, next) {
    // router.post('/cancelorder', function (req, res, next) {
    var orderId = req.body.order_id;
    var note = req.body.note;
    var csrId = Auth.getSignedUser(req).id;
    // var csrId = 1;

    Orders.isDelivered(orderId).then(function (delivered) {
        if (!delivered) {
            // Put CSR action
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
    // router.post('/refunditems', function (req, res, next) {
    var orderId = req.body.order_id;
    var refundItems = req.body.items; //items = {1: {id:1, depot_id: 2, modify_quantity:2}, {}}
    var note = req.body.note;
    var dateScheduled = req.body.date_scheduled;
    var dateScheduledNote = req.body.date_scheduled_note;
    var csrId = Auth.getSignedUser(req).id;
    // var csrId = 1;

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
// router.post('/cancelitems', function (req, res, next) {
    var orderId = req.body.order_id;
    var cancelItems = req.body.items; //items = {1: {id:1, depot_id: 2, modify_quantity:2}, {}}
    var note = req.body.note;
    var csrId = Auth.getSignedUser(req).id;
    // var csrId = 1;

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

                                        //TODO: Send sms 
                                        //TODO: Email                                

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
    // router.post('/additems', function (req, res, next) {
    var orderId = req.body.order_id;
    var note = req.body.note;
    var csrId = Auth.getSignedUser(req).id;
    // var csrId = 1;
    var products = req.body.products; //items = {1: {id:1, depot_id: 2, modify_quantity:2}, {}}        
    var transactionId = req.body.transaction_id;

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
            var productKeys = Object.keys(products);
            var superCategory = productKeys[0];
            Orders.createOrder(userId, orderInfo.delivery_address, orderInfo.delivery_latitude, orderInfo.delivery_longitude, isGuest, transactionId, superCategory).then(function (orderId) {
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
        });
    });
});



module.exports = router;
