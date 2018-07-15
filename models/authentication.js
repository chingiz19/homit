/**
 * @copyright Homit 2018
 */

var bcrypt = require('bcrypt');
var pub = {};
const saltRounds = 10;

var RolesJar = {
    CUSTOMER: "customer",
    CSR: "csr",
    STORE: "store",
    DRIVER: "driver"
}

/**
 * Signing user cookie
 * @param {*} req request object from HTTP calls
 * @param {*} user object with additional data to store in session
 * @param {*} role assigned role to session 
 */
pub.signSession = function (req, user, role) {
    return signSession(req, user, role);
}

pub.invalidate = async function (req) {
    let result = {};

    if (req.session.role == RolesJar.DRIVER) {
        let user = Auth.getSignedUser(req);
        result = await Driver.destroyFirebaseTokenById(user.id);
    }

    if (req.session) {
        req.session.destroy();
    }

    return result;
};

/**
 * Returns user object that was assigned during signature
 * @param {HTTP req} req request object for http call
 */
pub.getSignedUser = function (req) {
    if (req.session && req.session.user) {
        return Object.assign({}, req.session.user);
    }
    return false;
}

/**
 * Validation function for HTTP calls
 * Will redirect only CSR related calls if unauthorized to /notfound
 * @param {* String} role role to verify from RolesJar 
 * @param {* Object} options redirect options, for customer cases when redirects to main page
 */
pub.validate = function (role, options) {
    return function (req, res, next) {
        if (checkAuth(req, role)) {
            return next();
        }
        if (options && options.redirect) {
           return res.redirect("/");
        } else if (role && role == RolesJar.CSR) {
            return res.redirect("/notfound");
        } else {
           return ErrorMessages.sendErrorResponse(res, ErrorMessages.UIMessageJar.NOT_AUTHORIZED);
        }
    }
};

/**
 * Validation function for Driver App calls
 * @param {* Object} id driver id
 */
pub.validateDriver = function () {
    return async function (req, res, next) {
        let user = await Auth.getSignedUser(req);

        if (user && user.id == req.body.driver_id) {
            return next();
        } else {
            ErrorMessages.sendBadRequest(res, ErrorMessages.UIMessageJar.NOT_AUTHORIZED);
        }
    }
};

/**
 * Authenticated static file serving for driver app 
 */
pub.driverPhotoAuth = function () {
    return async function (req, res, next) {
        let user = await Auth.getSignedUser(req);

        if (user && req.session.role == RolesJar.DRIVER) {
            req.url = getDriverPhotoPath(user.user_email, req.url);
            next();
        } else {
            res.redirect("/notfound")
        }
    }
};

/**
 * Validation functions for Socket connections
 * @param {*} socket object received when connection initially established
 * @param {*} role role to compare against
 */
pub.validateWebSocket = function (socket, role) {
    return socket.handshake && socket.handshake.session && socket.handshake.session.signedIn && socket.handshake.session.role == role;
}

/* Converts plain password into hashed password */
pub.hashPassword = function (plainPassword) {
    return bcrypt.hash(plainPassword, saltRounds).then(function (hash) {
        return hash;
    });
};

/* Compares plain password to hashed password */
pub.comparePassword = function (plainPassword, hashPassword) {
    return bcrypt.compare(plainPassword, hashPassword).then(function (match) {
        return match;
    });
}

/**
 * Helper function to authenticate
 * @param {*} req request object from HTTP calls
 * @param {*} role role to compare against 
 */
function checkAuth(req, role) {
    return req.session && req.session.signedIn && req.session.role == role;
}

/**
 * Helper function to sign user's session
 * @param {*} req request object from HTTP calls
 * @param {*} user user object to store additional data
 * @param {*} role assigned role
 */
function signSession(req, user, role) {
    req.session.user = user;
    req.session.signedIn = true;
    req.session.role = role;
    return true;
}

/**
 * Helper function to build photo path
 * @param {* Object} username username (e.g. cbakhish)
 */
function getDriverPhotoPath(input, url) {
    let username = input.split("@")[0];
    let array = url.split("/");
    let finalUrl = "/";

    finalUrl += username;
    finalUrl += "/";
    finalUrl += array[1];

    return finalUrl;
}

pub.RolesJar = RolesJar;

module.exports = pub;