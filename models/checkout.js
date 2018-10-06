let pub = {};

const ZERO_DOLLAR_CHARGE = "zero_dollars";

pub.validateStoresOpen = async function(storeTypes, scheduleDetails) {
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
pub.sendOrderEmail = async function(email, firstName, lastName, phone, address, cardDigits, orderIds, scheduleDetails, allPrices) {
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

pub.createOrders = async function createOrders(userId, address, address_lat, address_long, driverInstruction, unitNumber,
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
                NM.sendOrderToCM(cmUserId, address, "o_" + cmOrderId, storeType, false);
            }

            SMS.alertDirectors("Order has been placed. Processed. Order ID is: " + cmOrderId + " has scheduled delivery --> " + hasSchedDel);

            tmpOrders[cmOrderId] = userOrder;

            i++;
        }
        userOrders.orders = tmpOrders;
        return userOrders;
    });
}

pub.chargeFailed = function(error, res) {
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

pub.postCharge = async function(chargeResult, res, birth_year, birth_month, birth_day,
    address, address_lat, address_long, phone, unitNumber, driverInstruction,
    allPrices, storeProducts, scheduleDetails, userObject) {

    let cardDigits = chargeResult == ZERO_DOLLAR_CHARGE ? "0000" : chargeResult.source.last4;
    let chargeId = chargeResult == ZERO_DOLLAR_CHARGE ? "zero-dollar-charge" : chargeResult.id;
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
        if (couponsUsed[i].privacy_type == Coupon.privacy_types.private && !userObject.isGuest) {
            await Coupon.decrementUserCoupon(couponsUsed[i].coupon_id, userId);
        } else if (couponsUsed[i].privacy_type == Coupon.privacy_types.private_guest) {
            await Coupon.invalidatePrivateGuestCoupon(couponsUsed[i].coupon_id);
        }
    }

    // create orders
    let placedOrders = await Checkout.createOrders(userId, address, address_lat, address_long, driverInstruction,
        unitNumber, phone, userObject.isGuest, chargeId, cardDigits, allPrices, storeProducts, scheduleDetails);

    pub.sendOrderEmail(userObject.user_email, userObject.first_name, userObject.last_name, phone, address, cardDigits, placedOrders.orders, scheduleDetails, allPrices);

    if (userObject.isGuest) {
        Email.subscribeToGuestUsers(userObject.email, userObject.fname, userObject.lname);
    }

    return res.send({
        success: (placedOrders && true),
        orders: placedOrders
    });
};

function filterScheduledTime(time) {
    if (time) {
        return time;
    } else {
        return 0;
    }
}


module.exports = pub;