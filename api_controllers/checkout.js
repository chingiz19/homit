/**
 * @copyright Homit 2018
 */

var router = require("express").Router();

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
    let scheduleDetails = req.body.schedule_details;
    let unitNumber = req.body.user.unit_number;
    let couponDetails = req.body.coupon_details;

    Logger.log.info("Order has been placed", {
        email: email,
        fname: fname,
        phone: phone,
        address: address,
        driverInstruction: driverInstruction,
        unit_number: unitNumber,
        cartProducts: cartProducts
    });

    SMS.alertDirectors("Order has been placed. Processing...");

    let signedUser = Auth.getSignedUser(req);
    let paramsMissing = false;

    if (signedUser) {
        paramsMissing = !cartProducts || !phone || !address || !address_lat || !address_long || !cardToken || !scheduleDetails;
        couponDetails = Object.assign({ "user_id": signedUser.id, }, HelperUtils.formatUserCoupons(await Coupon.getUserCoupons(signedUser.id, true)));
    } else {
        paramsMissing = !email || !phone || !fname || !lname || !address || !address_lat || !address_long || !cartProducts || !cardToken || !scheduleDetails || !couponDetails;
    }

    if (!paramsMissing) {
        let dbProducts = await Catalog.getCartProducts(cartProducts);
        let storeProducts = Catalog.getCartProductsWithStoreType(dbProducts, cartProducts);

        let allStoresOpen = await validateStoresOpen(Object.keys(storeProducts), scheduleDetails);
        if (allStoresOpen) {
            let allPrices = await Catalog.calculatePrice(storeProducts, couponDetails);
            let totalPrice = allPrices.total_price;

            if (cardToken == 1) {
                let custId = Auth.getSignedUser(req).stripe_customer_id;
                MP.chargeCustomer(custId, totalPrice).then(async function (chargeResult) {
                    postCharge(chargeResult, res, birth_year, birth_month, birth_day,
                        address, address_lat, address_long, phone, unitNumber, driverInstruction,
                        allPrices, storeProducts, scheduleDetails, Object.assign({ isGuest: false }, signedUser));
                }, async function (error) {
                    chargeFailed(error, res);
                });
            } else {
                MP.chargeCard(cardToken, totalPrice).then(async function (chargeResult) {
                    postCharge(chargeResult, res, birth_year, birth_month, birth_day,
                        address, address_lat, address_long, phone, unitNumber, driverInstruction,
                        allPrices, storeProducts, scheduleDetails, { isGuest: true, "first_name": fname, "last_name": lname, "user_email": email });
                }, async function (error) {
                    chargeFailed(error, res);
                });
            }
        } else {
            ErrorMessages.sendErrorResponse(res);
            Logger.log.error("Order placed, but store was closed: ");
        }
    } else {
        ErrorMessages.sendBadRequest(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
    }
});

router.post('/calculate', async function (req, res) {
    let allValidParams = {
        "products": {},
        "coupon_details": {}
    };

    req.body = HelperUtils.validateParams(req.body, allValidParams);

    if (!req.body) {
        return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
    }

    let cartProducts = req.body.products;
    let dbProducts = await Catalog.getCartProducts(cartProducts);

    if (!dbProducts) {
        ErrorMessages.sendErrorResponse(res);
        return;
    }

    let user = await Auth.getSignedUser(req);
    let couponDetails = req.body.coupon_details;

    if (user) {
        couponDetails = Object.assign({ "user_id": user.id, }, HelperUtils.formatUserCoupons(await Coupon.getUserCoupons(user.id, true)));
    }

    let products = Catalog.getCartProductsWithStoreType(dbProducts, cartProducts);
    let allPrices = await Catalog.calculatePrice(products, couponDetails);

    let localResponse = {
        success: true,
        prices: allPrices
    }

    res.send(localResponse);
});

/**
 * Checks before customer pays
 * Validates user email and if all stores are open with given schedule details
 */
router.post('/check', async function (req, res) {
    let allValidParams = {
        "products": {},
        "schedule_details": {},
        "email": {}
    };

    req.body = HelperUtils.validateParams(req.body, allValidParams);

    if (!req.body) {
        return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
    }

    let userMessages = ["Success!", "Please, use valid email",
        "One or more stores are closed, please put scheduled delivery",
        "Email is not valid and one or more stores are closed"];

    let messageCounter = 0;
    let scheduleDetails = req.body.schedule_details;
    let cartProducts = req.body.products;
    let email = req.body.email;
    let dbProducts = await Catalog.getCartProducts(cartProducts);
    let emailIsOk = false;

    if (!dbProducts) {
        ErrorMessages.sendErrorResponse(res);
        return;
    }

    let storeProducts = Catalog.getCartProductsWithStoreType(dbProducts, cartProducts);
    let allStoresOpen = await validateStoresOpen(Object.keys(storeProducts), scheduleDetails);
    let user = await Auth.getSignedUser(req);

    if (user) {
        let savedUser = await User.findUserById(user.id);
        emailIsOk = savedUser.email_verified;
        userMessages[1]="Please verify your account. Verification email has been sent to your inbox";
    } else {
        emailIsOk = await Email.validateUserEmail(email);
    }

    if (!emailIsOk) {
        messageCounter += 1;
    }

    if (!allStoresOpen) {
        messageCounter += 2;
    }

    res.send({
        success: (allStoresOpen && emailIsOk),
        ui_message: userMessages[messageCounter]
    });
});

async function postCharge(chargeResult, res, birth_year, birth_month, birth_day,
    address, address_lat, address_long, phone, unitNumber, driverInstruction,
    allPrices, storeProducts, scheduleDetails, userObject) {

    let cardDigits = chargeResult.source.last4;
    let chargeId = chargeResult.id;
    let userId = userObject.id;
    let data = {};

    if (birth_year && birth_month && birth_day) {
        let birth_date = birth_year + "-" + birth_month + "-" + birth_day;
        data.birth_date = birth_date;
    }

    if (!userObject.isGuest) {
        data.address = address;
        data.address_latitude = address_lat;
        data.address_longitude = address_long;
        data.phone_number = phone;

        if (unitNumber) {
            data.address_unit_number = unitNumber;
        }

        await User.updateCheckoutUser(data, { "id": userId });
    } else {
        data.first_name = userObject.first_name;
        data.last_name = userObject.last_name;
        let guestUserFound = await User.findGuestUser(userObject.user_email);
        if (guestUserFound && guestUserFound.id) {
            userId = guestUserFound.id;
            await User.updateGuestUser(data, { "id": userId });
        } else {
            data.user_email = userObject.user_email;
            userId = await User.addGuestUser(data);
        }
    }

    let couponsUsed = allPrices.coupons_used;

    for (let i = 0; i < couponsUsed.length; i++) {
        if (couponsUsed[i].privacy_type = Coupon.privacy_types.private && !userObject.isGuest) {
            Coupon.decrementUserCoupon(couponsUsed[i].coupon_id, userId);
        } else {
            Coupon.invalidatePrivateGuestCoupon(couponsUsed[i].coupon_id);
        }
    }

    // create orders
    let placedOrders = await createOrders(userId, address, address_lat, address_long, driverInstruction,
        unitNumber, phone, userObject.isGuest, chargeId, cardDigits, allPrices, storeProducts, scheduleDetails);
    let response = {
        success: (placedOrders && true),
        orders: placedOrders
    };

    sendOrderEmail(userObject.user_email, userObject.first_name, userObject.last_name, phone, address, cardDigits, placedOrders.orders, scheduleDetails, allPrices);   

    if (userObject.isGuest) {
        Email.subscribeToGuestUsers(userObject.email, userObject.fname, userObject.lname);
    }

    res.send(response);
};

function chargeFailed(error, res) {
    if (error) {
        let errMessage = "Something went wrong while processing your order, please contact us at info@homit.ca";
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
        ErrorMessages.sendErrorResponse(res, errMessage);
    }
};

async function createOrders(userId, address, address_lat, address_long, driverInstruction, unitNumber,
    phoneNumber, isGuest, chargeId, cardDigits, allPrices, products, scheduleDetails) {
    
        let orderTransactionId = await Orders.createTransactionOrder(userId, address, address_lat, address_long, driverInstruction,
             unitNumber, phoneNumber, isGuest, chargeId, cardDigits, allPrices);

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
            await Orders.insertProducts(orderIds[i], products[storeType].products);
            let userOrder = {
                store_type: storeType,
                order_id: orderIds[i]
            };

            let cmOrderId = userOrder.order_id;

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

            SMS.alertDirectors("Order has been placed. Processed. Order ID is: " + cmOrderId + " has scheduled delivery --> " + hasSchedDel);

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
async function sendOrderEmail(email, firstName, lastName, phone, address, cardDigits, orderIds, scheduleDetails, allPrices) {
    let emailJson = {};

    let customerJson = {
        email: email,
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        address: address,
        card_digit: cardDigits,
        generalCouponInvoiceMessage: allPrices.general_coupon_invoice_message
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
            store_type_display_name: storeType.display_name,
            couponInvoiceMessage: allPrices.order_prices[storeType.name].coupon_invoice_message
        };

        ordersJson[storeType.name] = tmpOrder;
    }

    emailJson.orders = ordersJson;
    emailJson.customer = customerJson;

    Email.sendOrderSlip(emailJson, allPrices);
}

async function validateStoresOpen(storeTypes, scheduleDetails) {
    for (let i = 0; i < storeTypes.length; i++) {
        let storeType = storeTypes[i];
        if (scheduleDetails[storeType]) {
            if (!await Catalog.isStoreOpenForScheduled(storeType, scheduleDetails[storeType])) {
                Logger.log.error("Store was closed for order at: ", storeType, scheduleDetails[storeType]);
                return false;
            }
        } else {
            if (!await Catalog.isStoreOpenForDelivery(storeType)) {
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