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
    var transactionId = req.body.transaction_id;
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
        paramsMissing = !cartProducts || !phone || !address || !address_lat || !address_long || !transactionId;
    } else {
        paramsMissing = !email || !phone || !fname || !lname || !address || !address_lat || !address_long || !cartProducts || !transactionId;
    }

    if (!paramsMissing) {
        var isTransactionFine = await Orders.checkTransaction(transactionId);
        if (isTransactionFine) {
            var dbProducts = await Catalog.getCartProducts(cartProducts);
            var products = Catalog.getCartProductsWithSuperCategory(cartProducts, dbProducts);
            var allPrices = Catalog.getAllPricesForProducts(cartProducts, dbProducts);
            var totalPrice = allPrices.total_price;
            var transactionValid = MP.isTransactionValid(transactionId, totalPrice);
            if (transactionValid) {
                var cardDigits = MP.getUserCardLastDigits(transactionId);
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
                    //     var cardToken = MP.getUserCardToken(transactionDetails);
                    //     var cardType = MP.getUserCardType(transactionDetails);
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
                var userOrders = await createOrders(userId, address, address_lat, address_long, driverInstruction, isGuest, transactionId, cardDigits, allPrices, products);
                var response = {
                    success: true,
                    orders: userOrders
                };
                res.send(response);
            } else {
                var response = {
                    success: false,
                    error: {
                        dev_message: "Transaction details mismatch.",
                        ui_message: "Error happened while checkout. Please try again"
                    }
                };
                res.send(response);
                var specMetaData = {
                    directory: __filename,
                    requester_ip: req.connection.remoteAddress,
                    user_id: userId
                }
                Logger.log.warn("Transaction details mismatch.", specMetaData);
            }
        } else {
            var response = {
                success: false,
                error: {
                    dev_message: "Transaction ID already exists in database",
                    ui_message: "Error happened while checkout. Please try again"
                }
            };
            res.send(response);
            Logger.log.warn("Transaction ID already exists in database.", metaData);
        }
    } else {
        res.status(403).json({
            error: {
                "code": "U000",
                "dev_message": "Missing params"
            }
        });
    }
});

var createOrders = async function (userId, address, address_lat, address_long, driverInstruction, isGuest, transactionId, cardDigits, allPrices, products) {
    var orderTransactionId = await Orders.createTransactionOrder(userId, address, address_lat, address_long, driverInstruction, isGuest, transactionId, cardDigits, allPrices);

    var createFunctions = [];
    var userOrders = [];

    for (var superCategory in products) {
        createFunctions.push(Orders.createOrder(orderTransactionId, superCategory));
    }

    return Promise.all(createFunctions).then(function (orderIds) {
        var i = 0;
        for (var superCategory in products) {
            var inserted = Orders.insertProducts(orderIds[i], products[superCategory]);
            var userOrder = {
                super_category: superCategory,
                order_id: orderIds[i]
            };

            var cmUserId = "";
            var cmOrderId = "o_" + userOrder.order_id;
            if (isGuest) {
                cmUserId = "g_" + userId;
            } else {
                cmUserId = "u_" + userId;
            }
            CM.sendOrder(cmUserId, address, cmOrderId, superCategory);
            SMS.alertDirectors("Order has been placed. Processed. Order ID is: " + cmOrderId);
            userOrders.push(userOrder);
            i++;
        }
        return userOrders;
    });
}

module.exports = router;