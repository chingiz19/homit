/**
 * @copyright Homit 2018
 * Add all validator methods here\
 */

var validator = require("validator");
var pub = {};

/**
 * Check if text is email
 * @param {*} text - text to validate
 */
pub.isEmail = function(text){
    var str = convertToString(text); 
    return validator.isEmail(str);
}

/**
 * Check if text contains only letters
 * @param {*} text 
 */
pub.isText = function(text){
    var str = convertToString(text);
    return validator.matches(str, "^[a-zA-Z]+$");
}

/**
 * Check if text contains only numbers
 * @param {*} text 
 */
pub.isNumber = function(text){
    var str = convertToString(text);
    return validator.matches(str, "^[0-9]+$");
}

/**
 * Check if text contains only double/decimal numbers
 * @param {*} text 
 */
pub.isDouble = function(text){
    var str = convertToString(text);
    return validator.isDecimal(str);
}

/**
 * Check if text is phone number
 * @param {*} text 
 */
pub.isPhoneNumber = function(text){
    var str = convertToString(text);
    return validator.matches(str, "^[0-9]{10}$");
}

/**
 * Check if text is address
 * @param {*} text 
 */
pub.isAddress = function(text){
    var str = convertToString(text);
    return validator.matches(str, "^[\ a-zA-Z0-9,-.]+$");
}

/**
 * Check if text is in expected date format (e.g yyyy-mm--dd)
 * @param {*} text 
 */
pub.isDate = function(text){
    var str = convertToString(text);
    return validator.matches(str, "^(19|20)[0-9]{2}-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[01])$");
}

pub.makeDBSafe = function(text){
    var str = convertToString(text);
    var result = validator.blacklist(str, "'\"`"); // removes ', " and `
    return validator.stripLow(result); // removes everything that is not between ASCII 32 and 127 (refer to ASCII table for details)
}


function convertToString(text){
    return text + '';
}


module.exports = pub;