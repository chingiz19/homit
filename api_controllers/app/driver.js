/**
 * @copyright Homit 2017
 */

var router = require("express").Router();
var ip = require("ip");

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
            if (driver != false) {
                var driverId = driver.id_prefix + driver.id;
                var portId = Driver.getConnectionPort();
                var jwt_token = JWTToken.createToken({
                    driver_id: driverId
                });
                
                delete driver.id_prefix;
                driver.id = driverId;
                var response = {
                    success: true,
                    driver: driver,
                    jwt_token: jwt_token,
                    connection: {
                        //host: "70.72.208.119",
                        host: ip.address(),
                        port: portId
                    }
                };

                res.send(response);

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
