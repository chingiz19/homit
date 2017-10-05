/**
 * @author Jeyhun Gurbanov, Zaman Zamanli
 * @copyright Homit 2017
 */

var router = require("express").Router();

/**
 * Checks if user given exists in the database
 */
router.post('/userexists', function (req, res, next) {
    var email = req.body.email;
    if (!email) {
        res.status(403).json({
            error: {
                "code": "U000",
                "dev_message": "Missing params",
                "required_params": ["email"]
            }
        });
    } else {
        User.findUser(email).then(function (exists) {
            if (!exists) {
                res.json({
                    status: "success",
                    exists: false
                });
            } else {
                res.json({
                    status: "success",
                    exists: true
                });
            }
        });
    }
});

/**
 * Registers user
 */
router.post('/signup', function (req, res, next) {
    var fname = req.body.fname;
    var lname = req.body.lname;
    var email = req.body.email;
    var birth_day = req.body.birth_day;
    var birth_month = req.body.birth_month;
    var birth_year = req.body.birth_year;
    var password = req.body.password;

    if (!(fname && lname && email && password && birth_day && birth_month && birth_year)) {
        res.status(400).json({
            "error": {
                "code": "U000",
                "dev_message": "Missing params"
            }
        });
    } else {
        var birth_date = birth_year + "-" + birth_month + "-" + birth_day;
        Auth.hashPassword(password).then(function (hashedPassword) {
            User.findUser(email).then(function (exists) {
                if (!exists) {
                    var userData = {
                        user_email: email,
                        first_name: fname,
                        last_name: lname,
                        password: hashedPassword,
                        birth_date: birth_date
                    };
                    User.addUser(userData).then(function (user) {
                        req.session.user = user;
                        res.json({
                            status: "success",
                            ui_message: "Successfully signed up. You will receive an email with confirmation"
                        });
                    });
                } else {
                    res.json({
                        error: {
                            code: "A002",
                            "ui_message": "User already exists"
                        }
                    });
                }
            });
        });
    }
});

/**
 * Logs the user in
 */
router.post('/signin', function (req, res, next) {
    var email = req.body.email;
    var password = req.body.password;
    if (!(email && password)) {
        res.status(403).json({
            "error": {
                "code": "U000",
                "dev_message": "Missing params"
            }
        });
    } else {
        User.authenticateUser(email, password).then(function (user) {
            var errResponse = {
                error: {
                    code: "A003",
                    ui_message: "Invalid email, or password"
                }
            };
            if (!user) {
                res.json(errResponse);
            } else {
                Auth.sign(req, res, user);
                res.json({
                    status: "success",
                    ui_message: "Successfully signed in"
                });
            }
        });
    }
});

/**
 * Sign out the user
 */
router.post('/signout', function (req, res, next) {
    if (!req.session) {
        res.status(200).json({
            status: "success",
            ui_message: "Successfully logged out"
        });
        return;
    }

    Auth.clear(res);
    req.session.destroy(function (err) {
        if (err) {
            res.status(400).send({ "success": false, "ui_message": "Could not sign out, please try again" });
        } else {
            res.status(200).send({ "success": true, "ui_message": "Successfully logged out" });
        }
    });
});

/**
 * Forgot password
 */
router.post('/forgotpassword', function (req, res, next) {
    console.log("Not implemented");    
});

/**
 * Changes password
 */
router.post('/changepassword', function (req, res, next) {
    console.log("Not implemented");
});

module.exports = router;