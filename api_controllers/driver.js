/**
 * @copyright Homit 2017
 */

var router = require("express").Router();

router.post('/signin', function (req, res, next) {
    var email = req.query.email;
    var password = req.query.password;

    if (!(email && password)) {
        res.status(400).json({
            "error": {
                "code": "U000",
                "dev_message": "Missing params"
            }
        });
    } else {
        Driver.authenticateDriver(email, password).then(function (driver) {
            if (driver != false) {
                var driverId = driver.id_prefix + driver.id;
                Driver.getConnectionPort(driverId).then(function (portId) {
                    delete driver.id_prefix;
                    driver.id = driverId;
                    var response = {
                        success: true,
                        driver: driver,
                        connection: {
                            host: "",
                            port: portId
                        }
                    };

                    res.send(response);
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
