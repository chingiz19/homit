/**
 * @copyright Homit 2018
 */

var router = require("express").Router();

router.get('/activedrivers', Auth.validateCsr(), function (req, res, next) {
    Driver.getActiveDrivers().then(function (activeDrivers) {
        res.json({
            success: true,
            drivers: activeDrivers
        });
    });
});

router.post('/getroutes', Auth.validateCsr(), function (req, res, next) {
    var driverId = req.body.driver_id;
    Driver.getRoutes(driverId).then(function (routes) {
        res.json({
            success: true,
            routes: routes
        });
    });
});

module.exports = router;
