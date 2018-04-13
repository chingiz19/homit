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

    var allValidParams = ["email", "first_name", "last_name", "phone", "birth_day", "birth_month", "birth_year", "address"];
    if (!req.body.user || HelperUtils.hasInvalidParams(req.body.user, allValidParams)){
        return errorMessages.sendMissingParams(res);
    }

    // Special check for birth date
    if (req.body.user.birth_day || req.body.user.birth_month || req.body.user.birth_year){
        if (!(req.body.user.birth_day && req.body.user.birth_month && req.body.user.birth_year)){
            return errorMessages.sendMissingParams(res);    
        } else {
            //TODO
            // if not date is valid
            //      send missingParams error | or less generic error message
            //      log the error for debugging 
        }
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

router.post('/vieworders', async function (req, res, next) {
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
    if (card) {
        signedUser.card = card;
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