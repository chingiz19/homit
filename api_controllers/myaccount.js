/**
 * @copyright Homit 2017
 */

var router = require("express").Router();

router.post('/update', function (req, res, next) {
    if (req.cookies.user) {
        var id = req.body.user.id;
        var user_email = req.body.user.email;
        var first_name = req.body.user.fname;
        var last_name = req.body.user.lname;
        var phone_number = req.body.user.phone_number;
        var birth_date = req.body.user.birth_date;
        var address1 = req.body.user.address1;
        var address2 = req.body.user.address2;
        var address3 = req.body.user.address3;
        
        if (!id || !(user_email || first_name || last_name
            || phone_number || birth_date || address1 || address2 || address3)) {
            res.status(403).json({

                error: {
                    "code": "U000",
                    "dev_message": "Missing params",
                    "required_params": ["user_id", "email", "fname", "lname",
                        "phone_number", "birth_date", "address1", "address2", "address3"]
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
        if (birth_date) {
            userData.birth_date = birth_date;
        }
        if (address1) {
            userData.address1 = address1;
        }
        if (address2) {
            userData.address2 = address2;
        }
        if (address3) {
            userData.address3 = address3;
        }

        User.updateUser(userData, key).then(function (updatedUser) {
            console.log("User Data: " + userData);
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
    if (req.cookies.user) {
        var id = req.body.user_id;
        var oldPassword = req.body.old_password;
        var newPassword = req.body.new_password;
        if (!id || !oldPassword || !newPassword) {
            res.status(403).json({
                error: {
                    "code": "U000",
                    "dev_message": "Missing params",
                    "required_params": ["user_id", "email", "fname", "lname",
                        "phone_number", "birth_date", "address1", "address2", "address3"]
                }
            });
        } else {
            User.updatePassword(id, oldPassword, newPassword).then(function(updatedUser) {
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

module.exports = router;