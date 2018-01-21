/**
 * @copyright Homit 2018
 */

var cookiee = require('cookie-encryption');
var bcrypt = require('bcrypt');
var pub = {};
const saltRounds = 10;

/* Constructing cookie */
global.vault = cookiee(global.secretKey, {
    cookie: "homit",
    maxAge: 60 * 60 * 1000, // 1 hour
    signed: true,
    httpOnly: true
});

/* Building metadata for log */                                   
var logMeta = {
    directory: __filename
  }

/* Signing user cookie */
pub.sign = function (req, res, obj) {
    try {
        res.cookie("user", obj, { maxAge: 60 * 60 * 1000, httpOnly: false });
        vault.write(req, JSON.stringify(obj));
        return true;
    } catch (e) {
        var metaData = {
        directory: __filename,
        error_path: req.path, 
        error_message: e.message
    }
        Logger.log.error("Error while signing user cookie", metaData);
        return false;
    }
};

pub.clear = function (res) {
    res.clearCookie('homit');
    res.clearCookie('user');
    vault.flush();
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
            next();
            return;
        }
        if (options && options.redirect) {
            res.redirect("/");
        } else {
            res.redirect("/notfound");
        }
    }
};

function checkAuth(req) {
    if (req.session) {
        var user = vault.read(req);
        if (user && user.startsWith("{")) {
            user = JSON.parse(user);
            if (user.user_email == req.cookies.user.user_email) {
                return true;
            }
        }
    }
    return false;
}

function checkAuthCsr(req) {
    if (req.session) {
        var user = vault.read(req);
        if (user && user.startsWith("{")) {
            user = JSON.parse(user);
            if (user.user_email == req.cookies.user.user_email && user.role_id == 2) {
                return true;
            }
        }
    }
    return false;
}

pub.getSignedUser = function(req) {
    if (req.session) {
        var user = vault.read(req);
        if (user && user.startsWith("{")) {
            user = JSON.parse(user);
            if (user.user_email == req.cookies.user.user_email) {
                return user;
            }
        }
    }
    return false;
}

module.exports = pub;