/**
 * @copyright Homit 2018
 */

var router = require("express").Router();
var ip = require("ip");

router.post('/signin', function (req, res, next) {
    var email = req.body.email;
    var password = req.body.password;

    if (!(email && password)) {
        errorMessages.sendErrorResponse(res, errorMessages.UIMessageJar.MISSING_PARAMS);
    } else {
        Driver.authenticateDriver(email, password).then(function (driver) {
            if (driver != false) { 
                var driverId = driver.id_prefix + driver.id;
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
                        host: ip.address()
                    }
                };

                res.send(response);

            } else {
                errorMessages.sendBadRequest(res, errorMessages.UIMessageJar.INVALID_CREDENTIALS);
            }
        });
    }
});

module.exports = router;
