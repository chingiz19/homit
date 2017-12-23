/**
 * @copyright Homit 2017
 */

var router = require("express").Router();

router.post('/refundorder', function (req, res, next) {
    var orderId = req.body.order_id;
    var note = req.body.note;
    var dateScheduled = req.body.date_scheduled;
    var dateScheduledNote = req.body.date_scheduled_note;
    // var signedUser = Auth.getSignedUser(req);
    // var csrId = signedUser.id;    
    var csrId = 1;

    Orders.isDelivered(orderId).then(function (delivered) {
        if (delivered) {
            // Put CSR action
            CSR.refundAction(csrId, note).then(function (csrActionId) {
                // Put in orders_refund table
                Orders.placeFullRefund(orderId, csrActionId, dateScheduled, dateScheduledNote).then(function (placed) {
                    Orders.getUserWithOrderByOrderId(orderId).then(function (orderInfoResult) {
                        Orders.calculateModifiedAmount(orderId).then(function (refundAmount) {
                            var customerRefundAmount = refundAmount * (-1);

                            var orderEmailInfo = {
                                customer_email: orderInfoResult.user.user_email,
                                customer_name: orderInfoResult.user.first_name,
                                order_id: orderId,
                                refund_amount: customerRefundAmount
                            };

                            // Send email
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

module.exports = router;
