/**
 * @copyright Homit 2018
 */

var router = require("express").Router();
var crypto = require("crypto");

/* Check if user given exists in the database */
router.post('/userexists', async function (req, res, next) {
    let email = req.body.email;
    if (!email) {
        return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
    } else {
        let userExists = await User.findUser(email);
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
router.post('/signup', async function (req, res) {
    let fname = req.body.fname;
    let lname = req.body.lname;
    let email = req.body.email;
    let password = req.body.password;

    if (!(fname && lname && email && password)) {
        return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
    } else {
        let result = await Email.validateUserEmail(email);
        if (!result) {
            return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.INVALID_EMAIL_ADRESS);
        }
        let hashedPassword = await Auth.hashPassword(password);
        let userExists = await User.findUser(email);
        if (!userExists) {
            let stripeCustomerId = await User.makeStripeCustomer(email);
            let userData = {
                user_email: email,
                first_name: fname,
                last_name: lname,
                password: hashedPassword,
                stripe_customer_id: stripeCustomerId
            };
            let insertedUser = await User.addUser(userData);
            if (!isNaN(insertedUser)) {
                let user = await User.findUser(email);
                Auth.signSession(req, user, Auth.RolesJar.CUSTOMER);
                User.sendVerificationEmail(user);
                Email.subscribeToSignedUsers(email, fname, lname);
                res.json({
                    success: true,
                    ui_message: "Success!"
                });
            } else {
                return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.SIGNUP_ERROR);
            }
        } else {
            return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.USER_EXISTS);
        }
    }
});

/* Logs the user in */
router.post('/signin', async function (req, res) {
    let email = req.body.email;
    let password = req.body.password;
    let coupons = req.body.coupon_details;

    if (!(email && password && coupons)) {
        return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
    } else {
        let user = await User.authenticateUser(email, password);
        if (!user) {
            return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.INVALID_CREDENTIALS);
        } else {
            Auth.signSession(req, user, Auth.RolesJar.CUSTOMER);
            if (await Coupon.updateUserCoupons(coupons, user.id, true)) {
                return res.json({
                    success: true,
                    ui_message: "Successfully signed in"
                });
            } else {
                return ErrorMessages.sendErrorResponse(res);
            }
        }
    }
});

/* Sign out the user */
router.all('/signout', function (req, res) {
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
        return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
    }

    // Create jwt token
    let pHash = await User.getUserPasswordHash(req.body.email);
    // If user doesn't exist send true anyways (security measure, but wekaness is /userexists call)
    if (!pHash) {
        return res.status(200).json({
            success: true,
            ui_message: "Email has been sent with instructions"
        });
    }
    let token = JWTToken.createResetPasswordToken({
        email: req.body.email
    }, pHash);

    // clean up
    pHash = crypto.randomBytes(62).toString();

    // send via email 
    let emailSuccess = await Email.sendResetPasswordEmail({
        customer_email: req.body.email,
        resetLink: machineHostname + "/resetpassword/" + req.body.email + "/" + token
    });

    if (emailSuccess) {
        res.status(200).json({
            success: true,
            ui_message: "Email has been sent with instructions"
        });
    } else {
        ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.FAILED_EMAIL);
    }
});

/* Reset password API */
router.post('/resetpassword', async function (req, res, next) {
    // Check for email and token params
    if (!req.body.email || !req.body.token || !req.body.new_password || !req.body.confirm_password) {
        return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
    }

    // Assert that n_p, c_p match
    if (req.body.new_password != req.body.confirm_password) {
        return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.PASSWORD_MISMATCH);
    }

    // Check for valid email and token
    let pHash = await User.getUserPasswordHash(req.body.email);
    if (!pHash) {
        return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.INVALID_TOKEN);
    }

    let tokenValue = JWTToken.validateResetPasswordToken(req.body.token, pHash);
    pHash = crypto.randomBytes(62).toString(); // clean up
    if (!tokenValue || tokenValue.email != req.body.email) {
        return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.INVALID_TOKEN);
    }

    // Change password in db
    let updatedUser = await User.resetPassword(req.body.email, req.body.new_password);
    if (updatedUser) {
        res.json({
            success: true,
            ui_message: "Password was successfully updated"
        });
    } else {
        ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.CANT_UPDATE_PASSWORD);
    }
    // TODO: add email message
});

/* Login for CSR */
router.get("/csrlogin", async function (req, res, next) {
    let user = await CSR.authenticateCsrUser(req.query.username, req.query.password);
    if (!user) {
        return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.INVALID_CREDENTIALS);
    } else {
        Auth.signSession(req, user, Auth.RolesJar.CSR);
        res.redirect("/vieworders");
    }
});

module.exports = router;