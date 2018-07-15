/**
 * @copyright Homit 2018
 */

var pub = {};

pub.UIMessageJar = {
    MISSING_PARAMS:         "Missing params",
    USER_EXISTS:            "User already exists",
    INVALID_CREDENTIALS:    "Invalid email, or password",
    INVALID_EMAIL_ADRESS:   "Please use valid email address",
    PASSWORD_MISMATCH:      "new_password should match confirm_password",
    INVALID_TOKEN:          "Invalid token",
    CANT_UPDATE_PASSWORD:  "Something went wrong while updating password, please try again. If error persists contact us at info@homit.ca",
    GENERIC_MESSAGE:        "Ooops... Something went wrong, please try again. If error persists contact us at info@homit.ca",
    USER_NOT_SIGNED:        "User is not signed in",
    FAILED_EMAIL:           "Couldn't send email, make sure email is valid. If persists contact customer service at at info@homit.ca",
    NOT_AUTHORIZED:         "Not Authorized",
    PASSWORD_FAILED_UPDATE: "Couldn't update payment method, please try again",
    SIGN_UP_ERROR:          "Sign up error, please refresh page and try again",
    EMAIL_ERROR:            "Please check your email or use different one"
}

/**
 * Fundamental function that will add sent message,
 * if not will send generic 'Oooopss..' message. Uses status 200
 * @param {*} res response stream from HTTP request  
 * @param {*} message message required to send
 */
pub.sendErrorResponse = function (res, message) {
    let localMessage = pub.UIMessageJar.GENERIC_MESSAGE;

    if (message) {
        localMessage = message;
    }

    res.status(200).json({
        success: false,
        ui_message: localMessage
    });
}

/**
 * Fundamental function that will add sent message,
 * if not will send generic 'Oooopss..' message. Uses status 403
 * @param {*} res response stream from HTTP request  
 * @param {*} message message required to send
 */
pub.sendBadRequest = function (res, message) {
    let localMessage = pub.UIMessageJar.GENERIC_MESSAGE;

    if (message) {
        localMessage = message;
    }

    res.status(403).json({
        success: false,
        ui_message: localMessage
    });
}

module.exports = pub;