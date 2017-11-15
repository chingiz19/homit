/**
 * @copyright Homit 2017
 */

var router = require("express").Router();

router.post('/signin', function (req, res, next) {
    var email = req.body.email;
    var password = req.body.password;

    if (!(email && password)) {
        res.status(400).json({
            "error": {
                "code": "U000",
                "dev_message": "Missing params"
            }
        });
    } else {
        Driver.authenticateDriver(email, password).then(function (driver) {
            if (driver!=false) {
                // TODO: Find port and connection info for driver and send it
                res.json({
                    success: true,
                    driver: driver,
                    ui_message: "Successfully signed in"
                });
            } else {
                res.json({
                    success: false,
                    ui_message: "Email or password don't match"
                });
            }
        });
    }
});

module.exports = router;
