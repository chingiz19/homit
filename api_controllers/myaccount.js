/**
 * @copyright Homit 2018
 */

var router = require("express").Router();

router.post('/update', function (req, res, next) {
    var signedUser = Auth.getSignedUser(req);
    if (signedUser != false) {
        var id = signedUser.id;
        var user_email = req.body.user.email;
        var first_name = req.body.user.fname;
        var last_name = req.body.user.lname;
        var phone_number = req.body.user.phone_number;
        var birth_day = req.body.user.birth_day;
        var birth_month = req.body.user.birth_month;
        var birth_year = req.body.user.birth_year;
        var address = req.body.user.address;
        var address_lat = req.body.user.address_latitude;
        var address_long = req.body.user.address_longitude;

        if (!(user_email || first_name || last_name
            || phone_number || (birth_day && birth_month && birth_year) || (address && address_lat && address_long))) {
            res.status(403).json({

                error: {
                    "code": "U000",
                    "dev_message": "Missing params"
                }
            });
        }

        var key = {
            id: id
        };

        var userData = {};

        if (user_email) {
            userData.user_email = user_email;
        }
        if (first_name) {
            userData.first_name = first_name;
        }
        if (last_name) {
            userData.last_name = last_name;
        }
        if (phone_number) {
            userData.phone_number = phone_number;
        }
        if (birth_year && birth_month && birth_day) {
            var birth_date = birth_year + "-" + birth_month + "-" + birth_day;
            userData.birth_date = birth_date;
        }
        if (address && address_lat && address_long) {
            userData.address = address;
            userData.address_latitude = address_lat;
            userData.address_longitude = address_long;
        }

        User.updateUser(userData, key).then(function (updatedUser) {
            if (updatedUser) {
                User.findUserById(id).then(function (newUser) {
                    Auth.sign(req, res, newUser);
                    var response = {
                        user: newUser,
                        success: true
                    };
                    res.send(response);
                });
            } else {
                var response = {
                    success: false,
                    error: {
                        dev_message: "Something went wrong while updating the user",
                        ui_message: "Error happened while updating the user. Please try again"
                    }
                };
                res.send(response);
            }
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

router.post('/resetpassword', function (req, res, next) {
    var signedUser = Auth.getSignedUser(req);
    if (signedUser != false) {
        var id = signedUser.id;
        var oldPassword = req.body.old_password;
        var newPassword = req.body.new_password;

        if (!oldPassword || !newPassword) {
            res.status(403).json({
                error: {
                    "code": "U000",
                    "dev_message": "Missing params",
                    "required_params": ["old_password", "new_password"]
                }
            });
        } else {
            User.updatePassword(id, oldPassword, newPassword).then(function (updatedUser) {
                if (updatedUser) {
                    var response = {
                        success: true,
                    };
                    res.send(response);
                } else {
                    var response = {
                        success: false,
                        error: {
                            dev_message: "Password didn't match.",
                            ui_message: "Password didn't match."
                        }
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

module.exports = router;