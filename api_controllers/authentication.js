/**
 * @copyright Homit 2018
 */

var router = require("express").Router();
var crypto = require("crypto");

/* Check if user given exists in the database */
router.post('/userexists', async function (req, res, next) {
    var email = req.body.email;
    if (!email) {
        return errorMessages.sendErrorResponse(res, errorMessages.UIMessageJar.MISSING_PARAMS);
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
    var password = req.body.password;

    if (!(fname && lname && email && password)) {
        return errorMessages.sendErrorResponse(res, errorMessages.UIMessageJar.MISSING_PARAMS);
    } else {
        var hashedPassword = await Auth.hashPassword(password);
        var userExists = await User.findUser(email);
        if (!userExists) {
            var stripeCustomerId = await User.makeStripeCustomer(email);
            var userData = {
                user_email: email,
                first_name: fname,
                last_name: lname,
                password: hashedPassword,
                stripe_customer_id: stripeCustomerId
            };
            var insertedUser = await User.addUser(userData);
            if (!isNaN(insertedUser)) {
                var user = await User.findUser(email);
                Auth.signCustomerSession(req, user);
                Email.subscribeToSignedUsers(email, fname, lname);
                res.json({
                    success: true,
                    ui_message: "Successfully signed up. You will receive an email with confirmation"   // do they? 
                });
            } else {
                res.json({
                    success: false,
                    ui_message: "Sign up error, please refresh page and try again."   
                });
            }
        } else {
            return errorMessages.sendErrorResponse(res, errorMessages.UIMessageJar.USER_EXISTS);
        }
    }
});

/* Logs the user in */
router.post('/signin', async function (req, res, next) {
    var email = req.body.email;
    var password = req.body.password;
    if (!(email && password)) {
        return errorMessages.sendErrorResponse(res, errorMessages.UIMessageJar.UIMessageJar.MISSING_PARAMS);
    } else {
        var user = await User.authenticateUser(email, password);
        if (!user) {
            return errorMessages.sendErrorResponse(res, errorMessages.UIMessageJar.INVALID_CREDENTIALS);
        } else {
            Auth.signCustomerSession(req, user);
            res.json({
                success: true,
                ui_message: "Successfully signed in"
            });
        }
    }
});

/* Sign out the user */
router.all('/signout', function (req, res, next) {
    Auth.invalidate(req);
    res.status(200).json({ "success": true, "ui_message": "Successfully logged out" });
});

/**
 * Forgot password API
 * Send user email with reset link
 */
router.post('/forgotpassword', async function (req, res, next) {
    // Require email in body
    if (!req.body.email) {
        return errorMessages.sendErrorResponse(res, errorMessages.UIMessageJar.MISSING_PARAMS);
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
        resetLink: machineHostname + "/resetpassword/" + req.body.email + "/" + token
    });

    if (emailSuccess) {
        res.status(200).json({
            success: true,
            ui_message: "Email has been sent with instructions"
        });
    } else {
        errorMessages.sendErrorResponse(res, errorMessages.UIMessageJar.FAILED_EMAIL);
    }
});

/* Reset password API */
router.post('/resetpassword', async function (req, res, next) {
    // Check for email and token params
    if (!req.body.email || !req.body.token || !req.body.new_password || !req.body.confirm_password) {
        return errorMessages.sendErrorResponse(res, errorMessages.UIMessageJar.MISSING_PARAMS);
    }

    // Assert that n_p, c_p match
    if (req.body.new_password != req.body.confirm_password) {
        return errorMessages.sendErrorResponse(res, errorMessages.UIMessageJar.PASSWORD_MISMATCH);
    }

    // Check for valid email and token
    var pHash = await User.getUserPasswordHash(req.body.email);
    if (!pHash) {
        return errorMessages.sendErrorResponse(res, errorMessages.UIMessageJar.INVALID_TOKEN);
    }

    var tokenValue = JWTToken.validateResetPasswordToken(req.body.token, pHash);
    pHash = crypto.randomBytes(62).toString(); // clean up
    if (!tokenValue || tokenValue.email != req.body.email) {
        return errorMessages.sendErrorResponse(res, errorMessages.UIMessageJar.INVALID_TOKEN);
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
        return errorMessages.sendErrorResponse(res, errorMessages.UIMessageJar.INVALID_CREDENTIALS);
    } else {
        Auth.signCSRSession(req, user);
        res.redirect("/vieworders");
    }
});

module.exports = router;