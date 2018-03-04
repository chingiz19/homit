/**
 * @copyright Homit 2018
 */

var router = require("express").Router();

/* Building metadata for log */
var metaData = {
    directory: __filename
}

router.post('/placeorder', async function (req, res, next) {
    var email = req.body.user.email;
    var fname = req.body.user.fname;
    var lname = req.body.user.lname;
    var phone = req.body.user.phone;
    var address = req.body.user.address;
    var address_long = req.body.user.address_longitude;
    var address_lat = req.body.user.address_latitude;
    var driverInstruction = req.body.user.driver_instruction;
    var birth_day = req.body.user.birth_day;
    var birth_month = req.body.user.birth_month;
    var birth_year = req.body.user.birth_year;
    var cartProducts = req.body.products;
    var cardToken = req.body.token_id;
    var saveCard = req.body.save_card;

    Logger.log.info("Order has been placed", {
        email: email,
        fname: fname,
        phone: phone,
        address: address,
        driverInstruction: driverInstruction,
        cartProducts: cartProducts
    });

    SMS.alertDirectors("Order has been placed. Processing.");

    var signedUser = Auth.getSignedUser(req);
    var paramsMissing = false;

    if (signedUser) {
        paramsMissing = !cartProducts || !phone || !address || !address_lat || !address_long || !cardToken;
    } else {
        paramsMissing = !email || !phone || !fname || !lname || !address || !address_lat || !address_long || !cartProducts || !cardToken;
    }

    if (!paramsMissing) {
        var dbProducts = await Catalog.getCartProducts(cartProducts);
        var products = Catalog.getCartProductsWithStoreType(cartProducts, dbProducts);
        var allPrices = Catalog.getAllPricesForProducts(cartProducts, dbProducts);
        var totalPrice = allPrices.total_price;
        MP.charge(cardToken, totalPrice).then(async function (chargeResult) {
            var cardDigits = chargeResult.source.last4;
            var chargeId = chargeResult.id;
            var data = {
                phone_number: phone
            };
            if (birth_year && birth_month && birth_day) {
                var birth_date = birth_year + "-" + birth_month + "-" + birth_day;
                data.birth_date = birth_date;
            }
            var userId;
            var isGuest;
            if (signedUser) {
                isGuest = false;
                userId = signedUser.id
                var key = {
                    id: userId
                };
                var updatedUser = await User.updateUser(data, key);

                // This is not working right now. Will be implemented later
                // if (saveCard) {
                //     await User.updateCreditCard(key, saveCard, cardToken, cardDigits, cardType);
                // }
            } else {
                isGuest = true;
                var guestUserFound = await User.findGuestUser(email);
                data.first_name = fname;
                data.last_name = lname;
                if (guestUserFound) {
                    userId = guestUserFound.id;

                    var key = {
                        id: userId
                    };
                    var guestUser = await User.updateGuestUser(data, key);
                } else {
                    data.user_email = email;
                    userId = await User.addGuestUser(data);
                }
            }

            // create orders
            var userOrders = await createOrders(userId, address, address_lat, address_long, driverInstruction, isGuest, chargeId, cardDigits, allPrices, products);
            var response = {
                success: true,
                orders: userOrders
            };
            res.send(response);
        }, async function (error) {
            if (error) {
                var errMessage = "Something went wrong while processing your order, please contact us at +1(403) 800-3460.";
                switch (error.type) {
                    case 'StripeCardError':
                        errMessage = "Card has been declined.";
                        Logger.log.debug("A declined card error", error);
                        break;
                    case 'RateLimitError':
                        Logger.log.error("Too many requests made to the API too quickly", error);
                        break;
                    case 'StripeInvalidRequestError':
                        Logger.log.error("Invalid parameters were supplied to Stripe's API", error);
                        break;
                    case 'StripeAPIError':
                        Logger.log.error("An error occurred internally with Stripe's API", error);
                        break;
                    case 'StripeConnectionError':
                        Logger.log.error("Some kind of error occurred during the HTTPS communication", error);
                        break;
                    case 'StripeAuthenticationError':
                        Logger.log.error("You probably used an incorrect API key", error);
                        break;
                    case MP.declinedByNetwork:
                        errMessage = "Card has been declined.";
                        Logger.log.error("Payment has been declined by issuer (network).", error);
                        break;
                    default:
                        Logger.log.error("Handle any other types of unexpected errors", error);
                        break;
                }
                res.status(200).json({
                    success: false,
                    error: {
                        "code": "U000",
                        "message": errMessage
                    }
                });
            }
        });
    } else {
        res.status(403).json({
            error: {
                "code": "U000",
                "dev_message": "Missing params"
            }
        });
    }
});

var createOrders = async function (userId, address, address_lat, address_long, driverInstruction, isGuest, chargeId, cardDigits, allPrices, products) {
    var orderTransactionId = await Orders.createTransactionOrder(userId, address, address_lat, address_long, driverInstruction, isGuest, chargeId, cardDigits, allPrices);

    var createFunctions = [];
    var userOrders = [];

    for (var storeType in products) {
        createFunctions.push(Orders.createOrder(orderTransactionId, storeType));
    }

    return Promise.all(createFunctions).then(function (orderIds) {
        var i = 0;
        for (var storeType in products) {
            var inserted = Orders.insertProducts(orderIds[i], products[storeType]);
            var userOrder = {
                storeType: storeType,
                order_id: orderIds[i]
            };

            var cmUserId = "";
            var cmOrderId = "o_" + userOrder.order_id;
            if (isGuest) {
                cmUserId = "g_" + userId;
            } else {
                cmUserId = "u_" + userId;
            }
            CM.sendOrder(cmUserId, address, cmOrderId, storeType);
            SMS.alertDirectors("Order has been placed. Processed. Order ID is: " + cmOrderId);
            userOrders.push(userOrder);
            i++;
        }
        return userOrders;
    });
}

module.exports = router;