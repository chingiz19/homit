/**
 * @copyright Homit 2018
 */

var router = require("express").Router();

/* Building metadata for log */
var metaData = {
    directory: __filename
}

router.post('/placeorder', async function (req, res, next) {
    let email = req.body.user.email;
    let fname = req.body.user.fname;
    let lname = req.body.user.lname;
    let phone = req.body.user.phone;
    let address = req.body.user.address;
    let address_long = req.body.user.address_longitude;
    let address_lat = req.body.user.address_latitude;
    let driverInstruction = req.body.user.driver_instruction;
    let birth_day = req.body.user.birth_day;
    let birth_month = req.body.user.birth_month;
    let birth_year = req.body.user.birth_year;
    let cartProducts = req.body.products;
    let cardToken = req.body.token_id;
    let saveCard = req.body.save_card;
    let scheduleDetails = req.body.schedule_details;
    let unitNumber = req.body.user.unit_number;

    Logger.log.info("Order has been placed", {
        email: email,
        fname: fname,
        phone: phone,
        address: address,
        driverInstruction: driverInstruction,
        unit_number: unitNumber,
        cartProducts: cartProducts
    });

    SMS.alertDirectors("Order has been placed. Processing.");

    let signedUser = Auth.getSignedUser(req);
    let paramsMissing = false;

    if (signedUser) {
        paramsMissing = !cartProducts || !phone || !address || !address_lat || !address_long || !cardToken || !scheduleDetails;
    } else {
        paramsMissing = !email || !phone || !fname || !lname || !address || !address_lat || !address_long || !cartProducts || !cardToken || !scheduleDetails;
    }

    if (!paramsMissing) {
        let dbProducts = await Catalog.getCartProducts(cartProducts);
        let storeProducts = Catalog.getCartProductsWithStoreType(dbProducts, cartProducts);

        let allStoresOpen = await validateStoresOpen(Object.keys(storeProducts), scheduleDetails);
        if (allStoresOpen) {
            let allPrices = Catalog.getAllPricesForProducts(storeProducts);
            let totalPrice = allPrices.total_price;

            if (cardToken == 1) {
                var custId = Auth.getSignedUser(req).stripe_customer_id;
                MP.chargeCustomer(custId, totalPrice).then(async function (chargeResult) {
                    let cardDigits = chargeResult.source.last4;
                    let chargeId = chargeResult.id;
                    let data = {};
                    if (birth_year && birth_month && birth_day) {
                        let birth_date = birth_year + "-" + birth_month + "-" + birth_day;
                        data.birth_date = birth_date;
                    }
                    let userId;
                    let isGuest;
                    if (signedUser) {
                        isGuest = false;
                        data.address = address;
                        data.address_latitude = address_lat;
                        data.address_longitude = address_long;
                        data.phone_number = phone;

                        if (unitNumber) {
                            data.address_unit_number = unitNumber;
                        }

                        userId = signedUser.id
                        let key = {
                            id: userId
                        };
                        await User.updateCheckoutUser(data, key);
                    } else {
                        isGuest = true;
                        data.first_name = fname;
                        data.last_name = lname;
                        let guestUserFound = await User.findGuestUser(email);
                        if (guestUserFound) {
                            userId = guestUserFound.id;

                            let key = {
                                id: userId
                            };
                            let guestUser = await User.updateGuestUser(data, key);
                        } else {
                            data.user_email = email;
                            userId = await User.addGuestUser(data);
                        }
                    }

                    // create orders
                    let placedOrders = await createOrders(userId, address, address_lat, address_long, driverInstruction,
                        unitNumber, phone, isGuest, chargeId, cardDigits, allPrices, storeProducts, scheduleDetails);
                    let response = {
                        success: true,
                        orders: placedOrders
                    };

                    sendOrderEmail(email, fname, lname, phone, address, cardDigits, placedOrders.orders, scheduleDetails);

                    if (isGuest) {
                        Email.subscribeToGuestUsers(email, fname, lname);
                    }

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
                        errorMessages.sendErrorResponse(res, errMessage);
                    }
                });
            } else {
                MP.chargeCard(cardToken, totalPrice).then(async function (chargeResult) {
                    let cardDigits = chargeResult.source.last4;
                    let chargeId = chargeResult.id;
                    let data = {};
                    if (birth_year && birth_month && birth_day) {
                        let birth_date = birth_year + "-" + birth_month + "-" + birth_day;
                        data.birth_date = birth_date;
                    }
                    let userId;
                    let isGuest;
                    if (signedUser) {
                        isGuest = false;
                        data.address = address;
                        data.address_latitude = address_lat;
                        data.address_longitude = address_long;
                        data.phone_number = phone;

                        if (unitNumber) {
                            data.address_unit_number = unitNumber;
                        }

                        userId = signedUser.id
                        let key = {
                            id: userId
                        };
                        await User.updateCheckoutUser(data, key);
                    } else {
                        isGuest = true;
                        data.first_name = fname;
                        data.last_name = lname;
                        let guestUserFound = await User.findGuestUser(email);
                        if (guestUserFound) {
                            userId = guestUserFound.id;

                            let key = {
                                id: userId
                            };
                            let guestUser = await User.updateGuestUser(data, key);
                        } else {
                            data.user_email = email;
                            userId = await User.addGuestUser(data);
                        }
                    }

                    // create orders
                    let placedOrders = await createOrders(userId, address, address_lat, address_long, driverInstruction,
                        unitNumber, phone, isGuest, chargeId, cardDigits, allPrices, storeProducts, scheduleDetails);
                    let response = {
                        success: true,
                        orders: placedOrders
                    };

                    sendOrderEmail(email, fname, lname, phone, address, cardDigits, placedOrders.orders, scheduleDetails);

                    if (isGuest) {
                        Email.subscribeToGuestUsers(email, fname, lname);
                    }

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
                        errorMessages.sendErrorResponse(res, errMessage);
                    }
                });
            }
        } else {
            errorMessages.sendErrorResponse(res);
            Logger.log.error("Order placed, but store was closed: ");
        }
    } else {
        errorMessages.sendBadRequest(res, errorMessages.UIMessageJar.MISSING_PARAMS);
    }
});

router.post('/checkout', async function (req, res, next) {
    var cartProducts = req.body.products;
    var productsResult = await Catalog.checkProductsForStoreOpen(cartProducts);

    var response = {
        success: true,
        all_stores_open: productsResult.all_stores_open,
        products: productsResult.products
    };
    res.send(response);
});

router.post('/calculate', async function (req, res, next) {
    var allValidParams = {
        "products": {}
    };
    req.body = HelperUtils.validateParams(req.body, allValidParams);
    
    if (!req.body) {
        return errorMessages.sendErrorResponse(res, errorMessages.UIMessageJar.MISSING_PARAMS);
    }

    let cartProducts = req.body.products;
    let dbProducts = await Catalog.getCartProducts(cartProducts);
    
    if (!dbProducts) {
        errorMessages.sendErrorResponse(res);
        return;
    }

    let products = Catalog.getCartProductsWithStoreType(dbProducts, cartProducts);
    let allPrices = Catalog.getAllPricesForProducts(products);

    let localResponse = {
        success: true,
        prices: allPrices
    }

    res.send(localResponse);
});


var createOrders = async function (userId, address, address_lat, address_long, driverInstruction, unitNumber,
    phoneNumber, isGuest, chargeId, cardDigits, allPrices, products, scheduleDetails) {
    let orderTransactionId = await Orders.createTransactionOrder(userId, address, address_lat, address_long, driverInstruction, unitNumber, phoneNumber, isGuest, chargeId, cardDigits, allPrices);

    let createFunctions = [];
    let userOrders = {};
    let orderPrices = allPrices.order_prices;

    userOrders.transaction_id = orderTransactionId;

    for (let storeType in products) {
        createFunctions.push(Orders.createOrder(orderTransactionId, storeType, orderPrices[storeType], HelperUtils.timestampToSqlDate(scheduleDetails[storeType])));
    }

    return Promise.all(createFunctions).then(async function (orderIds) {
        let cmUserId = "";
        if (isGuest) {
            cmUserId = "g_" + userId;
        } else {
            cmUserId = "u_" + userId;
        }

        userOrders.customer_id = cmUserId;

        let tmpOrders = {};

        let i = 0;
        for (let storeType in products) {
            let hasSchedDel = false;
            let inserted = await Orders.insertProducts(orderIds[i], products[storeType].products);
            let userOrder = {
                store_type: storeType,
                order_id: orderIds[i]
            };

            let cmOrderId = "o_" + userOrder.order_id;

            if (scheduleDetails[storeType]) { //if there is time field then it is scheduled order
                hasSchedDel = true;
                Scheduler.scheduleDelivery(scheduleDetails[storeType], {
                    userId: cmUserId,
                    address: address,
                    orderId: cmOrderId,
                    storeType: storeType
                });
            } else {
                NM.sendOrderToCM(cmUserId, address, cmOrderId, storeType);
            }

            SMS.alertDirectors("Order has been placed. Processed. Order ID is: " + cmOrderId + "has scheduled delivery --> " + hasSchedDel);

            tmpOrders[cmOrderId] = userOrder;

            i++;
        }
        userOrders.orders = tmpOrders;
        return userOrders;
    });
}

/**
 * Send order email
 * 
 * @param {*} email 
 * @param {*} firstName 
 * @param {*} lastName 
 * @param {*} phone 
 * @param {*} address 
 * @param {*} cardDigits 
 * @param {*} orderIds 
 */
var sendOrderEmail = async function (email, firstName, lastName, phone, address, cardDigits, orderIds, scheduleDetails) {
    let emailJson = {};

    let customerJson = {
        email: email,
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        address: address,
        card_digit: cardDigits
    };

    let ordersJson = {};

    for (let currentOrder in orderIds) {
        let orderId = orderIds[currentOrder].order_id;
        let products = await Orders.getOrderItemsById(orderId);
        let storeType = await Catalog.getStoreTypeInfo(orderIds[currentOrder].store_type);

        let tmpOrder = {
            scheduledTime: filterScheduledTime(scheduleDetails[storeType.name]),
            id: currentOrder,
            products: products,
            store_type_display_name: storeType.display_name
        };

        ordersJson[storeType.name] = tmpOrder;
    }

    emailJson.orders = ordersJson;
    emailJson.customer = customerJson;

    Email.sendOrderSlip(emailJson);
}

var validateStoresOpen = async function (storeTypes, scheduleDetails) {
    for (let i = 0; i < storeTypes.length; i++) {
        let storeType = storeTypes[i];
        if (scheduleDetails[storeType]) {
            let timeValid = await Catalog.isStoreOpenForScheduled(storeType, scheduleDetails[storeType]);
            if (!timeValid) {
                Logger.log.error("Store was closed for order at: ", storeType, scheduleDetails[storeType]);
                return false;
            }
        } else {
            let timeValid = await Catalog.isStoreOpenForDelivery(storeType);
            if (!timeValid) {
                Logger.log.error("Store was closed for asap order: ", storeType);
                return false;
            }
        }
    }
    return true;
}

function filterScheduledTime(time) {
    if (time) {
        return time;
    } else {
        return 0;
    }
}

module.exports = router;