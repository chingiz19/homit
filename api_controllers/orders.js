var router = require("express").Router();

router.post('/vieworders', Auth.validateAdmin(), function (req, res, next) {
    var phone_number = req.body.phone_number;
    return User.findUserByPhone(phone_number).then(function (user) {
        if (user != false) {
            var user_info = {
                id: user.id,
                isGuest: false,
                user_email: user.user_email,
                first_name: user.first_name,
                last_name: user.last_name,
                phone_number: user.phone_number,
                birth_date: user.birth_date,
                address1: user.address1,
                address2: user.address2,
                address3: user.address3
            }
            Orders.getOrdersByUserId(user.id).then(function (data) {
                res.json({
                    success: true,
                    user_info: user_info,
                    orders: data
                });
            });
        } else {
            User.findGuestUserByPhone(phone_number).then(function (guest) {
                var user_info = {
                    id: guest.id,
                    isGuest: true,
                    user_email: guest.user_email,
                    first_name: guest.first_name,
                    last_name: guest.last_name,
                    phone_number: guest.phone_number
                }
                Orders.getOrdersByGuestId(guest.id).then(function (data) {
                    res.json({
                        success: true,
                        user_info: user_info,
                        orders: data
                    });
                });
            });
        }
    });
});

module.exports = router;