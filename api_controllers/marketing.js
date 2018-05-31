var router = require("express").Router();

router.post('/subscribe', async function (req, res, next) {
    var email = req.body.email;

    if (email) {
        let success = await Email.subscribeToGuestUsers(email);
        if (success) {
            res.status(200).json({
                success: true,
                ui_message: "Successfully Subscribed!"
            });
        } else {
            errorMessages.sendEmailSubscribeError(res);
        }
    } else {
        errorMessages.sendMissingParams(res);
    }
});

module.exports = router;