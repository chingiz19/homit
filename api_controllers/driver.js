/**
 * @copyright Homit 2018
 */

var router = require("express").Router();

router.get('/onlinedrivers', Auth.validateCsr(), function (req, res, next) {
    Driver.getOnlineDrivers().then(function (onlineDrivers) {
        res.json({
            success: true,
            drivers: onlineDrivers
        });
    });
});

router.post('/getroutes', Auth.validateCsr(), function(req, res, next) {
    var driverId = req.body.driver_id;
    Driver.getRoutes(driverId).then(function (routes) {
        res.json({
            success: true,
            routes: routes
        });
    });
});

module.exports = router;
