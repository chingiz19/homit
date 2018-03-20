/**
 * @copyright Homit 2018
 */

var router = require("express").Router();
var crypto = require("crypto");

/* Check if user given exists in the database */
router.post('/userexists', async function (req, res, next) {
    var email = req.body.email;
    if (!email) {
        return errorMessages.sendMissingParams(res, ["email"]);
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

/* Register user */
router.post('/signup', async function (req, res, next) {
    var fname = req.body.fname;
    var lname = req.body.lname;
    var email = req.body.email;
    var birth_day = req.body.birth_day;
    var birth_month = req.body.birth_month;
    var birth_year = req.body.birth_year;
    var password = req.body.password;

    if (!(fname && lname && email && password)) {
        return errorMessages.sendMissingParams(res);
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
            return errorMessages.sendUserAlreadyExists(res);
        }
    }
});

/* Logs the user in */
router.post('/signin', async function (req, res, next) {
    var email = req.body.email;
    var password = req.body.password;
    if (!(email && password)) {
        return errorMessages.sendMissingParams(res);
    } else {
        var user = await User.authenticateUser(email, password);
        if (!user) {
            return errorMessages.sendInvalidCredentials(res);
        } else {
            Auth.sign(req, res, user);
            res.json({
                status: "success",
                ui_message: "Successfully signed in"
            });
        }
    }
});

/* Sign out the user */
router.all('/signout', function (req, res, next) {
    Auth.clear(res);
    res.status(200).json({ "success": true, "ui_message": "Successfully logged out" });
});

/**
 * Forgot password API
 * Send user email with reset link
 */
router.post('/forgotpassword', async function (req, res, next) {
    // Require email in body
    if (!req.body.email) {
        return errorMessages.sendMissingParams(res);
    }

    // Create jwt token
    var pHash = await User.getUserPasswordHash(req.body.email);
    // If user doesn't exist send true anyways (security measure, but wekaness is /userexists call)
    if (!pHash) {
        return res.status(200).json({
            success: true,
            ui_message: "Email has been sent with instructions"
        });
    }
    var token = JWTToken.createResetPasswordToken({
        email: req.body.email
    }, pHash);

    // clean up
    pHash = crypto.randomBytes(62).toString();

    // send via email 
    var emailSuccess = await Email.sendResetPasswordEmail({
        customer_email: req.body.email,
        resetLink: "https://www.homit.ca/resetpassword/" + req.body.email + "/" + token
    });

    if (emailSuccess) {
        res.status(200).json({
            success: true,
            ui_message: "Email has been sent with instructions"
        });
    } else {
        res.status(200).json({
            success: false,
            ui_message: "Couldn't send email, make sure email is valid. If persists contact customer service at at info@homit.ca or 403.800.3460"
        });
    }
});

/* Reset password API */
router.post('/resetpassword', async function (req, res, next) {
    // Check for email and token params
    if (!req.body.email || !req.body.token || !req.body.new_password || !req.body.confirm_password) {
        return errorMessages.sendMissingParams(res);
    }

    // Assert that n_p, c_p match
    if (req.body.new_password != req.body.confirm_password) {
        return res.status(200).json({
            error: {
                dev_message: "new_password should match confirm_password"
            }
        });
    }

    // Check for valid email and token
    var pHash = await User.getUserPasswordHash(req.body.email);
    if (!pHash) {
        return errorMessages.sendInvalidToken(res);
    }

    var tokenValue = JWTToken.validateResetPasswordToken(req.body.token, pHash);
    pHash = crypto.randomBytes(62).toString(); // clean up
    if (!tokenValue || tokenValue.email != req.body.email) {
        return errorMessages.sendInvalidToken(res);
    }

    // Change password in db
    var updatedUser = await User.resetPassword(req.body.email, req.body.new_password);
    if (updatedUser) {
        res.json({
            success: true,
            ui_message: "Password was successfully updated"
        });
    } else {
        res.json({
            success: false,
            ui_message: "Something went wrong while updating password, please try again. If error persists contact us at info@homit.ca or 403.800.3460"
        });
    }
    // TODO: add email message
});

/* Login for CSR */
router.get("/csrlogin", async function (req, res, next) {
    var user = await CSR.authenticateCsrUser(req.query.username, req.query.password);
    if (!user) {
        return errorMessages.sendInvalidCredentials(res);
    } else {
        Auth.sign(req, res, user);
        res.redirect("/vieworders");
    }
});

module.exports = router;