/**
 * @copyright Homit 2018
 */

var bcrypt = require('bcrypt');
var pub = {};
const saltRounds = 10;

/* Building metadata for log */
var logMeta = {
    directory: __filename
}

var UserRoles = {
    customer: "customer",
    csr: "csr",
    store: "store"
}

/* Signing customer cookie*/
pub.signCustomerSession = function (req, user) {
    return signSession(req, user, UserRoles.customer);
}

/* Signing CSR cookie*/
pub.signCSRSession = function (req, csr) {
    return signSession(req, csr, UserRoles.csr);
}

/* Signing Stores cookie*/
pub.signStoreSession = function (req, storeId) {
    req.session.signedIn = true;
    req.session.role = UserRoles.store;
    req.session.store_id = storeId;
    return true;
}

pub.invalidate = function (req) {
    if (req.session) {
        req.session.destroy();
    }
};

pub.validate = function (options) {
    return function (req, res, next) {
        if (checkAuth(req)) {
            Logger.log.verbose("Authenticated", logMeta);
            return next();
        }
        if (options && options.redirect) {
            Logger.log.verbose("Redirected", logMeta);
            res.redirect("/");
        } else {
            Logger.log.verbose("R400");
            res.status(400).send("Not Authorized");
        }
    }
};

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

pub.validateCsr = function (options) {
    return function (req, res, next) {
        if (checkAuthCsr(req)) {
            return next();
        }
        if (options && options.redirect) {
            res.redirect("/");
        } else {
            res.redirect("/notfound");
        }
    }
};

/* HTTP calls */
pub.validateStore = function (req) {
    return req.session && req.session.signedIn && req.session.role == UserRoles.store;
}

/* Socket IO */
pub.validateStoreWebSocket = function (scoket) {
    return scoket.handshake && scoket.handshake.session && scoket.handshake.session.signedIn && scoket.handshake.session.role == UserRoles.store;
}

/* Socket IO */
pub.validateCSRWebSocket = function (scoket) {
    return scoket.handshake && scoket.handshake.session && scoket.handshake.session.signedIn && scoket.handshake.session.role == UserRoles.csr;
}

function checkAuth(req) {
    return req.session && req.session.signedIn;
}

function checkAuthCsr(req) {
    return req.session && req.session.signedIn && req.session.role == UserRoles.csr;
}

function signSession(req, user, role) {
    req.session.user = user;
    req.session.signedIn = true;
    req.session.role = role;
    return true;
}

pub.getSignedUser = function (req) {
    if (req.session && req.session.user) {
        return Object.assign({}, req.session.user);
    }
    return false;
}

module.exports = pub;