/**
 * @copyright Homit 2017
 */

var cookiee = require('cookie-encryption');
var bcrypt = require('bcrypt');
const saltRounds = 10;

global.vault = cookiee(global.secretKey, {
    cookie: "homit",
    maxAge: 60 * 60 * 1000, // 1 hour
    signed: true,
    httpOnly: true
});

var pub = {};

pub.sign = function (req, res, obj) {
    try {
        res.cookie("user", obj, { maxAge: 60 * 60 * 1000, httpOnly: false });
        vault.write(req, JSON.stringify(obj));
        return true;
    } catch (e) {
        console.log(e);
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
            console.log("authenticated");
            next();
        }
        if (options && options.redirect) {
            console.log("redirect");
            
            res.redirect("/");
        } else {
            console.log("r400");
            
            res.status(400).send("Not Authorized");
        }
    }
};

/**
 * Converts plain password into hashed password
 */
pub.hashPassword = function (plainPassword) {
    return bcrypt.hash(plainPassword, saltRounds).then(function (hash) {
        return hash;
    });
};

/**
 * Compares plain password to hashed password
 */
pub.comparePassword = function (plainPassword, hashPassword) {
    return bcrypt.compare(plainPassword, hashPassword).then(function (match) {
        return match;
    });
}

pub.validateAdmin = function (options) {
    return function (req, res, next) {
        if (checkAuthAdmin(req)) {
            next();
            return;
        }
        if (options && options.redirect) {
            res.redirect("/");
        } else {
            // TODO: Not found should be generic
            res.status(404).send("Not Found");
        }
    }
};

function checkAuth(req) {
    if (req.session) {
        var user = vault.read(req);
        console.log(user);
        if (user && user.startsWith("{")) {
            user = JSON.parse(user);
            if (user.user_email == req.cookies.user.user_email) {
                return true;
            }
        }
    }
    return false;
}

function checkAuthAdmin(req) {
    if (req.session) {
        var user = vault.read(req);
        console.log(user);
        if (user && user.startsWith("{")) {
            user = JSON.parse(user);
            if (user.user_email == req.cookies.user.user_email && user.role_id == 2) {
                return true;
            }
        }
    }
    return false;
}

module.exports = pub;