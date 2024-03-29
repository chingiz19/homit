/**
 * @copyright Homit 2018
 * @example Source: https://www.npmjs.com/package/jsonwebtoken
 */

var jwt = require('jsonwebtoken');
const secretKey = "dfiuhdfgkdfhj";
const defaultExpire = "10h";
var pub = {};

/* Helper functions below */
pub.createToken = function (data, expiresIn) {
    let expires = defaultExpire;
    if (expiresIn) {
        expires = expiresIn;
    }
    let token = jwt.sign(data, secretKey, { expiresIn: expires });
    return token;
};

pub.validateToken = function (token) {
    return _validateToken(token, secretKey);
};

pub.createResetPasswordToken = function (data, secret) {
    return jwt.sign(data, secret, { expiresIn: '24h' });
}

pub.validateResetPasswordToken = function (token, secret) {
    return _validateToken(token, secret);
};

/**
 * Validating recieved token
 * @param {*String} token 
 * @param {*String} secret 
 */
function _validateToken(token, secret) {
    try {
        return jwt.verify(token, secret);
    } catch (err) {
        if (err == jwt.TokenExpiredError) {
            return false;
        } else {
            var metaData = {
                directory: __filename,
                error_message: err.message
            }
            Logger.log.error("Tried to validate wrong JWT token", metaData);
            return false;
        }
    }
}

module.exports = pub;