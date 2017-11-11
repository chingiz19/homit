/**
 * @copyright Homit 2017
 */

var router = require("express").Router();

router.post('/placeorder', function (req, res, next) {
    //TODO: Add support for Date of Birth (body.dob)
    var email = req.body.user.email;
    var fname = req.body.user.fname;
    var lname = req.body.user.lname;
    var phone = req.body.user.phone;
    var address = req.body.user.address;
    var products = req.body.products;

    var signedUser = Auth.getSignedUser(req);
    if (signedUser != false) {
        var userId = signedUser.id;
        if (!products || !phone || !address) {
            res.status(403).json({
                error: {
                    "code": "U000",
                    "dev_message": "Missing params",
                    "required_params": ["phone", "address", "products"]
                }
            });
        } else {
            var data = {
                phone_number: phone
            };
            var key = {
                id: userId
            };
            User.updateUser(data, key).then(function (updatedUser) {
                if (updatedUser != false) {
                    createOrder(userId, address, false, products).then(function (response) {
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
    } else {
        if (!email || !phone || !fname || !lname || !address || !products) {
            res.status(403).json({
                error: {
                    "code": "U000",
                    "dev_message": "Missing params",
                    "required_params": ["email", "phone", "fname", "lname", "address", "products"]
                }
            });
        } else {
            User.findGuestUser(email).then(function (guestUserFound) {
                if (guestUserFound == false) {
                    var data = {
                        user_email: email,
                        first_name: fname,
                        last_name: lname,
                        phone_number: phone
                    };
                    User.addGuestUser(data).then(function (guestUserId) {
                        if (guestUserId != false) {
                            createOrder(guestUserId, address, true, products).then(function (response) {
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
                    var key = {
                        id: guestUserFound.id
                    };
                    User.updateGuestUser(data, key).then(function (guestUser) {
                        if (guestUser != false) {
                            createOrder(guestUserFound.id, address, true, products).then(function (response) {
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
        }
    }
});

var createOrder = function (id, address, isGuest, products) {
    return Orders.createOrder(id, address, isGuest).then(function (order_id) {
        if (order_id != false) {
            var success = Orders.insertProducts(order_id, products);
            var response = {
                success: success
            };
            return response;
        } else {
            var response = {
                success: false,
                error: {
                    dev_message: "Something went wrong",
                    ui_message: "Error happened while checkout. Please try again"
                }
            };
            return response;
        }
    });
};

module.exports = router;