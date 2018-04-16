/**
 * @copyright Homit 2018
 */

var router = require("express").Router();

router.post('/update', Auth.validate(), async function (req, res, next) {
    var signedUser = Auth.getSignedUser(req);

    /* Checks and validations */

    if (!signedUser.id){
        // TODO: log error for degubbing
        Auth.invalidate(req);
        // TODO: need a way to let F.E know that a page refresh is required after showing error message
        return errorMessages.sendGenericError(res);        
    }

    var allValidParams = {
        "user_email": {}, 
        "first_name": {}, 
        "last_name": {}, 
        "phone_number": {
            isRemovable: true
        }, 
        "birth_date": {
            isRemovable: true
        }, 
        "address": {
            isRemovable: true
    }};
    req.body.user = HelperUtils.validateParams(req.body.user, allValidParams);
    if (!req.body.user){
        return errorMessages.sendMissingParams(res);
    }
    
    /* Update user info */

    var key = {
        id: signedUser.id
    };

    if (!(await User.updateUser(req.body.user, key))){
        return errorMessages.sendGenericError(res);
    }

    var newUser = await User.findUserById(signedUser.id);
    if (!newUser){
        return errorMessages.sendGenericError(res);
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
            return errorMessages.sendMissingParams(res);
        } else {
            User.updatePassword(id, currentPassword, newPassword).then(function (updatedUser) {
                if (updatedUser) {
                    let response = {
                        success: true
                    };
                    res.send(response);
                } else {
                    let response = {
                        success: false,
                        ui_message: "Wrong credintials"
                    };
                    res.send(response);
                }
            });
        }
    } else {
        res.status(403).json({
            error: {
                "code": "",
                "dev_message": "User is not signed in"
            }
        });
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
        res.status(403).json({
            error: {
                "code": "",
                "dev_message": "User is not signed in"
            }
        });
    }
});

router.post("/viewallorders", Auth.validate(), async function(req, res, next){
    var signedUser = Auth.getSignedUser(req);
    if (!signedUser){
        return errorMessages.sendGenericError(res);
    }
    var orders = [];
    var transactions = await Orders.getOrderTransactionsByUserId(signedUser.id);

    for (let tr of transactions){
        var individualOrders = await Orders.getOrdersByTransactionIdWithUserId(tr.id, signedUser.id);
        for (let individualOrder of individualOrders){            
            var order = {
                id: individualOrder.order_id,
                card_digits: tr.card_digits,
                delivery_address: tr.delivery_address,
                date_delivered: individualOrder.date_delivered
            }

            order.items = await Orders.getDisplayOrderItemsById(order.id);

            if (!order.date_delivered){
                order.date_delivered = "Pending...";
            }
            order.store = order.items[0].store_type_display_name;
            orders.push(order);
        }
}

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
            res.status(403).json({
                error: {
                    "code": "U000",
                    "dev_message": "Missing params",
                    "required_params": ["transaction_id"]
                }
            });
        }
    } else {
        res.status(403).json({
            error: {
                "code": "",
                "dev_message": "User is not signed in"
            }
        });
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
            res.status(403).json({
                error: {
                    "code": "U000",
                    "dev_message": "Missing params",
                    "required_params": ["order_id"]
                }
            });
        }
    } else {
        res.status(403).json({
            error: {
                "code": "",
                "dev_message": "User is not signed in"
            }
        });
    }
});

router.get('/user', Auth.validate(), async function (req, res, next) {
    var signedUser = Auth.getSignedUser(req);
    if (!signedUser) {
        return errorMessages.sendGenericError(res);
    }

    delete signedUser.id;
    delete signedUser.id_prefix;
    delete signedUser.password; // enforcing safety

    var card = await MP.getCustomerPaymentMethod(signedUser.stripe_customer_id);
    delete signedUser.stripe_customer_id;    
    if (card) {
        signedUser.card = card;
    }

    if (signedUser.birth_date){
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
        return errorMessages.sendGenericError(res);
    }

    if (!req.body.token){
        return errorMessages.sendMissingParams(res);
    }

    // add token to the user
    try{
        if(await MP.updateCustomerPaymentMethod(signedUser.stripe_customer_id, req.body.token)){
            res.send({
                success: true
            });
        }
    } catch(err){
        res.send({
            success: false,
            ui_message: "Couldn't update payment method, please try again"
        });
    }
});

module.exports = router;