/**
 * @copyright Homit 2017
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
        var address1 = req.body.user.address1;
        var address2 = req.body.user.address2;
        var address3 = req.body.user.address3;
        var address1_name = req.body.user.address1_name;
        var address2_name = req.body.user.address2_name;
        var address3_name = req.body.user.address3_name;
        var address1_lat = req.body.user.address1_latitude;
        var address1_long = req.body.user.address1_longitude;
        var address2_lat = req.body.user.address2_latitude;
        var address2_long = req.body.user.address2_longitude;
        var address3_lat = req.body.user.address3_latitude;
        var address3_long = req.body.user.address3_longitude;

        if (!(user_email || first_name || last_name
            || phone_number || (birth_day && birth_month && birth_year) || (address1 && address1_lat && address1_long)
            || (address2 && address2_lat && address2_long) || (address3 && address3_lat && address3_long) ||
            address1_name || address2_name || address3_name)) {
            res.status(403).json({

                error: {
                    "code": "U000",
                    "dev_message": "Missing params",
                    "required_params": ["email", "fname", "lname",
                        "phone_number", "birth_day", "birth_month", "birth_year", "address1", "address2", "address3",
                        "address1_name", "address2_name", "address3_name"]
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
        if (address1 && address1_lat && address1_long) {
            userData.address1 = address1;
            userData.address1_latitude = address1_lat;
            userData.address1_longitude = address1_long;
        }
        if (address2 && address2_lat && address2_long) {
            userData.address2 = address2;
            userData.address2_latitude = address2_lat;
            userData.address2_longitude = address2_long;
        }
        if (address3 && address3_lat && address3_long) {
            userData.address3 = address3;
            userData.address3_latitude = address3_latitude;
            userData.address3_longitude = address3_longitude;
        }
        if (address1_name) {
            userData.address1_name = address1_name;
        }
        if (address2_name) {
            userData.address2_name = address2_name;
        }
        if (address3_name) {
            userData.address3_name = address3_name;
        }

        User.updateUser(userData, key).then(function (updatedUser) {
            if (updatedUser) {
                var response = {
                    success: true,
                };
                res.send(response);
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

router.post('/vieworders', function (req, res, next) {
    var signedUser = Auth.getSignedUser(req);
    if (signedUser != false) {
        var userId = signedUser.id;

        Orders.getOrdersByUserId(userId).then(function (data) {
            res.json({
                success: true,
                orders: data
            });
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

router.post('/getorder', function (req, res, next) {
    var signedUser = Auth.getSignedUser(req);
    if (signedUser != false) {
        var userId = signedUser.id;
        var orderId = req.body.order_id;

        if (!orderId) {
            res.status(403).json({
                error: {
                    "code": "U000",
                    "dev_message": "Missing params",
                    "required_params": ["order_id"]
                }
            });
        }

        Orders.getOrderByIdUserId(orderId, userId).then(function (data) {
            if (data != false) {
                res.json({
                    success: true,
                    orders: data
                });
            } else {
                res.json({
                    success: false
                });
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

module.exports = router;