/**
 * @copyright Homit 2018
 */
let router = require("express").Router();

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
    let userObject = {};

    if (signedUser) {
        paramsMissing = !cartProducts || !phone || !address || !address_lat || !address_long || (cardToken == undefined) || !scheduleDetails;
        couponDetails = Object.assign({ "user_id": signedUser.id, }, HelperUtils.formatUserCoupons(await Coupon.getUserCoupons(signedUser.id, true)));
        userObject = Object.assign({ isGuest: false }, signedUser);
    } else {
        paramsMissing = !email || !phone || !fname || !lname || !address || !address_lat || !address_long || !cartProducts || (cardToken == undefined) || !scheduleDetails || !couponDetails;
        userObject = { isGuest: true, "first_name": fname, "last_name": lname, "user_email": email };
    }

    if (paramsMissing) {
        return ErrorMessages.sendBadRequest(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
    }

    let storeProducts = await Catalog.prepareProductsForCalculator(req.body.products);
    let allStoresOpen = await Checkout.validateStoresOpen(Object.keys(storeProducts.products), scheduleDetails);

    if (!allStoresOpen) {
        Logger.log.error("Order placed, but store was closed: ");
        return ErrorMessages.sendErrorResponse(res);
    }

    let allPrices = await Catalog.calculatePrice(storeProducts, couponDetails);
    let totalPrice = allPrices.total_price;

    //check if amount is zero then do not charge
    if (cardToken === 0 && totalPrice === 0) {
        return Checkout.postCharge(ZERO_DOLLAR_CHARGE, res, birth_year, birth_month, birth_day,
            address, address_lat, address_long, phone, unitNumber, driverInstruction,
            allPrices, storeProducts.products, scheduleDetails, userObject);
    }

    if (cardToken == 1) {
        let custId = Auth.getSignedUser(req).stripe_customer_id;
        MP.chargeCustomer(custId, totalPrice).then(async function (chargeResult) {
            Checkout.postCharge(chargeResult, res, birth_year, birth_month, birth_day,
                address, address_lat, address_long, phone, unitNumber, driverInstruction,
                allPrices, storeProducts.products, scheduleDetails, userObject);
        }, async function (error) {
            Checkout.chargeFailed(error, res);
        });
    } else {
        MP.chargeCard(cardToken, totalPrice).then(async function (chargeResult) {
            Checkout.postCharge(chargeResult, res, birth_year, birth_month, birth_day,
                address, address_lat, address_long, phone, unitNumber, driverInstruction,
                allPrices, storeProducts.products, scheduleDetails, userObject);
        }, async function (error) {
            Checkout.chargeFailed(error, res);
        });
    }
});

router.post('/calculate', async function (req, res) {
    let allValidParams = {
        "products": {},
        "coupon_details": {}
    };

    if (!HelperUtils.validateParams(req.body, allValidParams)) {
        return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
    }

    let couponDetails = req.body.coupon_details;
    let storeProducts = await Catalog.prepareProductsForCalculator(req.body.products);
    let user = await Auth.getSignedUser(req);

    if (user) {
        couponDetails = Object.assign({ "user_id": user.id, }, HelperUtils.formatUserCoupons(await Coupon.getUserCoupons(user.id, true)));
    }

    let allPrices = await Catalog.calculatePrice(storeProducts, couponDetails);

    return res.send({
        success: true && allPrices,
        prices: allPrices
    });
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
    let email = req.body.email;
    let emailIsOk = false;

    let storeProducts = await Catalog.prepareProductsForCalculator(req.body.products);
    let allStoresOpen = await Checkout.validateStoresOpen(Object.keys(storeProducts.products), scheduleDetails);
    let user = await Auth.getSignedUser(req);

    if (user) {
        let savedUser = await User.findUserById(user.id);
        emailIsOk = savedUser.email_verified;
        userMessages[1] = "Please verify your account. Verification email has been sent to your inbox";
    } else {
        emailIsOk = await Email.validateUserEmail(email);
    }

    if (!emailIsOk) {
        messageCounter += 1;
    }

    if (!allStoresOpen) {
        messageCounter += 2;
    }

    return res.send({
        success: (allStoresOpen && emailIsOk),
        ui_message: userMessages[messageCounter]
    });
});

/**
 * Checks if customer is signed in and if coupon is valid 
 */
router.post('/applykeyedcoupon', async function (req, res) {
    req.body = HelperUtils.validateParams(req.body, { "code": {}, "products": {} });

    if (!req.body) {
        return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.MISSING_PARAMS);
    }

    let signedUser = await Auth.getSignedUser(req);
    let isCouponOk = await Coupon.applyKeyedCoupon(req.body.code, req.body.products, signedUser.id)

    return res.send({
        "success": true,
        "is_signed_in": signedUser && true,
        "is_coupon_applied": isCouponOk.isApplied,
        "is_coupon_ok": isCouponOk.isOk,
        "message": isCouponOk.message,
        "assigned_by": isCouponOk.assignedBy,
        "can_be_applied": isCouponOk.canBeApplied
    });
});

module.exports = router;