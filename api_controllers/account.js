/**
 * @copyright Homit 2018
 */

let router = require("express").Router();
let _ = require("lodash");

/* Building metadata for log */
let metaData = {
    directory: __filename
}

/**
 * Used to apply and unapply user_coupons
 * Returns false if not signed in. This is used by FE to modify user coupons
 */
router.post('/updateStoreCoupon', async function (req, res) {
    let coupons = req.body.coupon_details;
    if (coupons) {
        let signedUser = Auth.getSignedUser(req);
        if (signedUser && signedUser.id) {
            let result = await Coupon.updateUserCoupons(coupons, signedUser.id, false);
            if (result.success) {
                return res.status(200).send({
                    success: true,
                    ui_message: result.ui_message
                });
            } else {
                return ErrorMessages.sendErrorResponse(res, result.ui_message);
            }
        } else {
            return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.USER_NOT_SIGNED);
        }
    }
    return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
});

router.post('/update', Auth.validate(Auth.RolesJar.CUSTOMER), async function (req, res, next) {
    let signedUser = Auth.getSignedUser(req);
    let emailChange = false;

    /* Checks and validations */

    if (!signedUser.id) {
        Logger.log.error("Undefined user id for signed user! Invalidated session", metaData);
        Auth.invalidate(req);
        // TODO: need a way to let F.E know that a page refresh is required after showing error message
        return ErrorMessages.sendErrorResponse(res);
    }

    let allValidParams = {
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
        return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
    }

    //Needs to go through couple security changes, if user wants to change their email 
    if (req.body.user.user_email && req.body.user.user_email != req.session.user.user_email) {
        emailChange = true;
        if (!await User.isEmailAvailable(req.body.user.user_email)) {
            return ErrorMessages.sendErrorResponse(res, "Couldn't update please use different email");
        } else if (!(await Email.validateUserEmail(req.body.user.user_email))) {
            return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.INVALID_EMAIL_ADRESS);
        }
    }

    /* Update user info */
    let key = {
        id: signedUser.id
    };

    if (!(await User.updateUser(req.body.user, key))) {
        return ErrorMessages.sendErrorResponse(res);
    }

    let newUser = await User.findUserById(signedUser.id);
    if (!newUser) {
        return ErrorMessages.sendErrorResponse(res);
    } else if (emailChange) {
        //user changed to new email, so request new email verification 
        await User.sendVerificationEmail(newUser);
    }

    Auth.signSession(req, newUser, Auth.RolesJar.CUSTOMER);
    res.status(200).send({
        success: true,
        ui_message: "Successfully updated"
    });
});

router.post('/resetpassword', Auth.validate(Auth.RolesJar.CUSTOMER), function (req, res, next) {
    var signedUser = Auth.getSignedUser(req);
    if (signedUser != false) {
        var id = signedUser.id;
        var currentPassword = req.body.current_password;
        var newPassword = req.body.new_password;

        if (!currentPassword || !newPassword) {
            return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
        } else {
            User.updatePassword(id, currentPassword, newPassword).then(function (updatedUser) {
                if (updatedUser) {
                    let response = {
                        success: true
                    };
                    res.send(response);
                } else {
                    ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.INVALID_CREDENTIALS)
                }
            });
        }
    } else {
        ErrorMessages.sendBadRequest(res, ErrorMessages.UIMessageJar.USER_NOT_SIGNED);
    }
});

router.post('/viewordertransactions', async function (req, res, next) {
    let signedUser = Auth.getSignedUser(req);
    if (signedUser) {
        let userId = signedUser.id;
        let data = await Orders.getOrderTransactionsByUserId(userId);
        res.json({
            success: true,
            transactions: data
        });
    } else {
        ErrorMessages.sendBadRequest(res, ErrorMessages.UIMessageJar.USER_NOT_SIGNED);
    }
});

router.post("/viewallorders", Auth.validate(Auth.RolesJar.CUSTOMER), async function (req, res, next) {
    let signedUser = Auth.getSignedUser(req);
    if (!signedUser) {
        return ErrorMessages.sendErrorResponse(res);
    }
    let orders = [];
    let transactions = await Orders.getOrderTransactionsByUserId(signedUser.id);

    for (let tr of transactions) {
        let individualOrders = await Orders.getOrdersByTransactionIdWithUserId(tr.id, signedUser.id);
        for (let individualOrder of individualOrders) {
            let order = {
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
    return res.status(200).json({
        success: true,
        orders: orders
    });
});

router.post('/vieworders', Auth.validate(Auth.RolesJar.CUSTOMER), async function (req, res, next) {
    var signedUser = Auth.getSignedUser(req);
    if (signedUser) {
        var userId = signedUser.id;
        var orderTransactionId = req.body.transaction_id;
        if (orderTransactionId) {
            var data = await Orders.getOrdersByTransactionIdWithUserId(orderTransactionId, userId);
            if (data) {
                return res.json({
                    success: true,
                    orders: data
                });
            } else {
                return res.json({
                    success: false
                });
            }

        } else {
            ErrorMessages.sendBadRequest(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
        }
    } else {
        ErrorMessages.sendBadRequest(res, ErrorMessages.UIMessageJar.USER_NOT_SIGNED);
    }
});

router.post('/getorder', async function (req, res, next) {
    let signedUser = Auth.getSignedUser(req);
    if (signedUser) {
        let userId = signedUser.id;
        let orderId = req.body.order_id;
        if (orderId) {
            let data = await Orders.getOrderItemsByIdUserId(orderId, userId);
            if (data) {
                return res.json({
                    success: true,
                    order: data
                });
            } else {
                return res.json({
                    success: false
                });
            }
        } else {
            ErrorMessages.sendBadRequest(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
        }
    } else {
        ErrorMessages.sendBadRequest(res, ErrorMessages.UIMessageJar.USER_NOT_SIGNED);
    }
});

router.get('/user', Auth.validate(Auth.RolesJar.CUSTOMER), async function (req, res, next) {
    let signedUser = Auth.getSignedUser(req);
    if (!signedUser) {
        return ErrorMessages.sendErrorResponse(res);
    }

    let coupons = await Coupon.getUserCoupons(signedUser.id);

    if (coupons) {
        signedUser.coupons = coupons;
    }

    let card = await MP.getCustomerPaymentMethod(signedUser.stripe_customer_id);
    delete signedUser.stripe_customer_id;
    if (card) {
        signedUser.card = card;
    }

    if (signedUser.birth_date) {
        let date = signedUser.birth_date.split("T")[0].split("-");
        signedUser.dob = date[1] + '-' + date[2] + '-' + date[0];
        delete signedUser.birth_date;
    }

    delete signedUser.id;
    delete signedUser.id_prefix;
    delete signedUser.password; // enforcing safety

    res.send({
        success: true,
        user: signedUser
    });
});

router.post('/paymentmethod/update', Auth.validate(Auth.RolesJar.CUSTOMER), async function (req, res, next) {
    var signedUser = Auth.getSignedUser(req);
    if (!signedUser) {
        return ErrorMessages.sendErrorResponse(res);
    }

    if (!req.body.token) {
        return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
    }

    // add token to the user
    try {
        if (await MP.updateCustomerPaymentMethod(signedUser.stripe_customer_id, req.body.token)) {
            return res.send({
                success: true
            });
        }
    } catch (err) {
        ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.PASSWORD_FAILED_UPDATE);
    }
});

router.post('/paymentmethod/remove', Auth.validate(Auth.RolesJar.CUSTOMER), async function (req, res, next) {
    var signedUser = Auth.getSignedUser(req);
    if (!signedUser) {
        return ErrorMessages.sendErrorResponse(res);
    }

    // add token to the user
    try {
        var card = await MP.getCustomerPaymentMethodAsToken(signedUser.stripe_customer_id);
        if (await MP.removeCustomerPaymentMethod(signedUser.stripe_customer_id, card)) {
            return res.send({
                success: true
            });
        } else {
            ErrorMessages.sendErrorResponse(res)
        }
    } catch (err) {
        ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.PASSWORD_FAILED_UPDATE);
    }
});

router.post('/reverify', Auth.validate(Auth.RolesJar.CUSTOMER), async function (req, res) {
    let signedUser = Auth.getSignedUser(req);
    if (!(signedUser && signedUser.user_email)) {
        return ErrorMessages.sendErrorResponse(res);
    }

    let result = await User.sendVerificationEmail(signedUser);

    if (result) {
        return res.send({
            success: true,
            ui_message: "Verification email successfully sent!"
        });
    } else {
        ErrorMessages.sendErrorResponse(res);
    }
});

module.exports = router;