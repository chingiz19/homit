/**
 * @copyright Homit 2017
 */

var router = require("express").Router();

/**
 * Checks if user given exists in the database
 */
router.post('/userexists', async function (req, res, next) {
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
        var userExists = await User.findUser(email);
        if (!userExists) {
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
    }
});

/**
 * Registers user
 */
router.post('/signup', async function (req, res, next) {
    var fname = req.body.fname;
    var lname = req.body.lname;
    var email = req.body.email;
    var birth_day = req.body.birth_day;
    var birth_month = req.body.birth_month;
    var birth_year = req.body.birth_year;
    var password = req.body.password;

    if (!(fname && lname && email && password)) {
        res.status(400).json({
            "error": {
                "code": "U000",
                "dev_message": "Missing params"
            }
        });
    } else {
        var hashedPassword = await Auth.hashPassword(password);
        var userExists = await User.findUser(email);
        if (!userExists) {
            var userData = {
                user_email: email,
                first_name: fname,
                last_name: lname,
                password: hashedPassword
            };
            if (birth_year && birth_month && birth_day) {
                var birth_date = birth_year + "-" + birth_month + "-" + birth_day;
                userData.birth_date = birth_date;
            }
            var insertedUser = await User.addUser(userData);
            //TODO: check for success
            var user = await User.findUser(email);
            Auth.sign(req, res, user);
            res.json({
                status: "success",
                ui_message: "Successfully signed up. You will receive an email with confirmation"
            });
        } else {
            res.json({
                error: {
                    code: "A002",
                    "ui_message": "User already exists" // TODO update this error message to non obvious one (security)
                }
            });
        }
    }
});

/**
 * Logs the user in
 */
router.post('/signin', async function (req, res, next) {
    var email = req.body.email;
    var password = req.body.password;
    if (!(email && password)) {
        res.status(200).json({
            "error": {
                "code": "U000",
                "dev_message": "Missing params"
            }
        });
    } else {
        var user = await User.authenticateUser(email, password);
        if (!user) {
            res.json({
                error: {
                    code: "A003",
                    ui_message: "Invalid email, or password"
                }
            });
        } else {
            Auth.sign(req, res, user);
            res.json({
                status: "success",
                ui_message: "Successfully signed in"
            });
        }
    }
});

/**
 * Sign out the user
 */
router.all('/signout', function (req, res, next) {
    Auth.clear(res);
    res.status(200).json({ "success": true, "ui_message": "Successfully logged out" });
});

/**
 * Forgot password
 */
router.post('/forgotpassword', function (req, res, next) {
    Logger.log("Not implemented");
});

/**
 * Changes password
 */
router.post('/changepassword', function (req, res, next) {
    Logger.log("Not implemented");
});

/**
 * Login for CSR
 */
router.get("/csrlogin", async function (req, res, next) {
    var user = User.authenticateCsrUser(req.query.username, req.query.password);
    if (!user) {
        res.json({
            error: {
                code: "A003"
            }
        });
    } else {
        Auth.sign(req, res, user);
        res.redirect("/vieworders");
    }
});

module.exports = router;