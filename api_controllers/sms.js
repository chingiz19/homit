/**
 * @copyright Homit 2018
 */

var router = require("express").Router();


router.post('/txtdriver', function (req, res, next) {
    var name = req.body.name;
    var number = req.body.number;
    var message = req.body.message;

    SMS.notifyDriver (message, name, number, function (message) {
        res.json({
            success: message,
        });
    });
});


module.exports = router;