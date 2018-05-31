/**
 * @copyright Homit 2018
 */

var router = require("express").Router();
var _ = require("lodash");

/* Building metadata for log */
var metaData = {
    directory: __filename
}

router.post('/update', Auth.validate(), async function (req, res, next) {
    var signedUser = Auth.getSignedUser(req);

    /* Checks and validations */

    if (!signedUser.id) {
        Logger.log.error("Undefined user id for signed user! Invalidated session", metaData);
        Auth.invalidate(req);
        // TODO: need a way to let F.E know that a page refresh is required after showing error message
        return errorMessages.sendErrorResponse(res);
    }

    var allValidParams = {
        "user_email": {
            validateWith: Validator.isEmail
        },
        "first_name": {
            validateWith: Validator.isText
        },
        "last_name": {
            validateWith: Validator.isText
        },
        "phone_number": {
            validateWith: Validator.isPhoneNumber
        },
        "birth_date": {
            validateWith: Validator.isDate
        },
        "address": {
            validateWith: Validator.isAddress
        },
        "address_unit_number": {
            isRemovable: true,
            validateWith: Validator.isNumber
        },
        "address_latitude": {
            validateWith: Validator.isDouble
        },
        "address_longitude": {
            validateWith: Validator.isDouble
        }
    };
    req.body.user = HelperUtils.validateParams(req.body.user, allValidParams);
    if (!req.body.user) {
        return errorMessages.sendErrorResponse(res, errorMessages.UIMessageJar.MISSING_PARAMS);
    }

    /* Update user info */

    var key = {
        id: signedUser.id
    };

    if (!(await User.updateUser(req.body.user, key))) {
        return errorMessages.sendErrorResponse(res);
    }

    var newUser = await User.findUserById(signedUser.id);
    if (!newUser) {
        return errorMessages.sendErrorResponse(res);
    }

    Auth.signCustomerSession(req, newUser);
    res.status(200).send({
        success: true,
        ui_message: "Successfully updated"
    });
});

router.post('/resetpassword', Auth.validate(), function (req, res, next) {
    var signedUser = Auth.getSignedUser(req);
    if (signedUser != false) {
        var id = signedUser.id;
        var currentPassword = req.body.current_password;
        var newPassword = req.body.new_password;

        if (!currentPassword || !newPassword) {
            return errorMessages.sendErrorResponse(res, errorMessages.UIMessageJar.MISSING_PARAMS);
        } else {
            User.updatePassword(id, currentPassword, newPassword).then(function (updatedUser) {
                if (updatedUser) {
                    let response = {
                        success: true
                    };
                    res.send(response);
                } else {
                    errorMessages.sendErrorResponse(res, errorMessages.UIMessageJar.INVALID_CREDENTIALS)
                }
            });
        }
    } else {
        errorMessages.sendBadRequest(res, errorMessages.UIMessageJar.USER_NOT_SIGNED);
    }
});

router.post('/viewordertransactions', async function (req, res, next) {
    var signedUser = Auth.getSignedUser(req);
    if (signedUser) {
        var userId = signedUser.id;
        var data = await Orders.getOrderTransactionsByUserId(userId);
        res.json({
            success: true,
            transactions: data
        });
    } else {
        errorMessages.sendBadRequest(res, errorMessages.UIMessageJar.USER_NOT_SIGNED);
    }
});

router.post("/viewallorders", Auth.validate(), async function (req, res, next) {
    var signedUser = Auth.getSignedUser(req);
    if (!signedUser) {
        return errorMessages.sendErrorResponse(res);
    }
    var orders = [];
    var transactions = await Orders.getOrderTransactionsByUserId(signedUser.id);

    for (let tr of transactions) {
        var individualOrders = await Orders.getOrdersByTransactionIdWithUserId(tr.id, signedUser.id);
        for (let individualOrder of individualOrders) {
            var order = {
                id: individualOrder.order_id,
                card_digits: tr.card_digits,
                delivery_address: tr.delivery_address,
                date_delivered: individualOrder.date_delivered
            }

            order.items = await Orders.getOrderItemsById(order.id);

            if (order.items.length > 0) {
                order.store = order.items[0].store_type_display_name;
            }

            if (!order.date_delivered) {
                order.date_delivered = "Pending...";
            }

            orders.push(order);
        }
    }

    orders = _.reverse(orders);
    res.status(200).json({
        success: true,
        orders: orders
    });
});

router.post('/vieworders', Auth.validate(), async function (req, res, next) {
    var signedUser = Auth.getSignedUser(req);
    if (signedUser) {
        var userId = signedUser.id;
        var orderTransactionId = req.body.transaction_id;
        if (orderTransactionId) {
            var data = await Orders.getOrdersByTransactionIdWithUserId(orderTransactionId, userId);
            if (data) {
                res.json({
                    success: true,
                    orders: data
                });
            } else {
                res.json({
                    success: false
                });
            }

        } else {
            errorMessages.sendBadRequest(res, errorMessages.UIMessageJar.MISSING_PARAMS);
        }
    } else {
        errorMessages.sendBadRequest(res, errorMessages.UIMessageJar.USER_NOT_SIGNED);
    }
});

router.post('/getorder', async function (req, res, next) {
    var signedUser = Auth.getSignedUser(req);
    if (signedUser) {
        var userId = signedUser.id;
        var orderId = req.body.order_id;
        if (orderId) {
            var data = await Orders.getOrderItemsByIdUserId(orderId, userId);
            if (data) {
                res.json({
                    success: true,
                    order: data
                });
            } else {
                res.json({
                    success: false
                });
            }
        } else {
            errorMessages.sendBadRequest(res, errorMessages.UIMessageJar.MISSING_PARAMS);
        }
    } else {
        errorMessages.sendBadRequest(res, errorMessages.UIMessageJar.USER_NOT_SIGNED);
    }
});

router.get('/user', Auth.validate(), async function (req, res, next) {
    var signedUser = Auth.getSignedUser(req);
    if (!signedUser) {
        return errorMessages.sendErrorResponse(res);
    }

    delete signedUser.id;
    delete signedUser.id_prefix;
    delete signedUser.password; // enforcing safety

    var card = await MP.getCustomerPaymentMethod(signedUser.stripe_customer_id);
    delete signedUser.stripe_customer_id;
    if (card) {
        signedUser.card = card;
    }

    if (signedUser.birth_date) {
        var date = signedUser.birth_date.split("T")[0].split("-");
        signedUser.dob = date[1] + '-' + date[2] + '-' + date[0];
        delete signedUser.birth_date;
    }
    res.send({
        success: true,
        user: signedUser
    });
});

router.post('/paymentmethod/update', Auth.validate(), async function (req, res, next) {
    var signedUser = Auth.getSignedUser(req);
    if (!signedUser) {
        return errorMessages.sendErrorResponse(res);
    }

    if (!req.body.token) {
        return errorMessages.sendErrorResponse(res, errorMessages.UIMessageJar.MISSING_PARAMS);
    }

    // add token to the user
    try {
        if (await MP.updateCustomerPaymentMethod(signedUser.stripe_customer_id, req.body.token)) {
            res.send({
                success: true
            });
        }
    } catch (err) {
        errorMessages.sendErrorResponse(res, errorMessages.UIMessageJar.PASSWORD_FAILED_UPDATE);
    }
});

router.post('/paymentmethod/remove', Auth.validate(), async function (req, res, next) {
    var signedUser = Auth.getSignedUser(req);
    if (!signedUser) {
        return errorMessages.sendErrorResponse(res);
    }

    // add token to the user
    try {
        var card = await MP.getCustomerPaymentMethodAsToken(signedUser.stripe_customer_id);
        if (await MP.removeCustomerPaymentMethod(signedUser.stripe_customer_id, card)) {
            res.send({
                success: true
            });
        } else {
            errorMessages.sendErrorResponse(res)
        }
    } catch (err) {
        errorMessages.sendErrorResponse(res, errorMessages.UIMessageJar.PASSWORD_FAILED_UPDATE);
    }
});

module.exports = router;