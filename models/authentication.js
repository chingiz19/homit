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


const UserRoles = {
    customer: "customer",
    csr: "csr"
}

/* Signing customer cookie*/
pub.signCustomerSession = function(req, user){
    return signSession(req, user, UserRoles.customer);
}

/* Signing customer cookie*/
pub.signCSRSession = function(req, csr){
    return signSession(req, csr, UserRoles.csr);
}

pub.invalidate = function (req) {
    req.session.destroy();
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
            res.status(400).send("Not Authorized", logMeta);
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

pub.getSignedUser = function(req) {
    if (req.session && req.session.user) {
        return Object.assign({}, req.session.user);
    }
    return false;
}

module.exports = pub;