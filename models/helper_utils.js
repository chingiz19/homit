/**
 * @copyright Homit 2018
 * Add all helpers that could be shared among models here.
 */

var pub = {};

/**
 * Takes Object and checks that invalid params(e.g typos in name, unexpected) params do not exist
 * 
 * @param {*} obj - object to check/validate againsts
 * @param {*} validParams - all valid params that might be in obj. It is param-options mapping.
 * 
 * @returns False or sanitized/validated object with params
 * 
 * Options for validParams:
 *          (OPTIONAL)  isRemovable: boolean - Allows field/column to be removed from Database. If set will convert params equal 'remove' to undefined. This is required to remove from db
 *          (OPTIONAL)  validateWith: function - Passes in function to be 
 * 
 */
pub.validateParams = function (obj, validParams) {
    if (!obj) return false;

    var clone = Object.assign({}, obj);

    for (let param in validParams) {
        if (!clone[param]) continue;

        // check if removable field
        if (validParams[param].isRemovable && obj[param] == 'remove') {
            obj[param] = undefined;
        }

        // check for validation
        if (obj[param] && validParams[param].validateWith && !validParams[param].validateWith(obj[param])) {
            return false;
        }

        // remove valid params
        delete clone[param];
    }

    if (Object.keys(clone) != 0) {
        return false;
    } else {
        return obj;
    }
}

pub.timestampToSqlDate = function (timestamp) {
    if (!timestamp) {
        return undefined;
    }

    let date = new Date(timestamp);

    let fullYear = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();

    //2018-05-03 19:02:57

    return fullYear + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
}

pub.timestampToSqlDatOfWeek = function (timestamp) {
    let date = new Date(timestamp);
    return date.getDay() + 1;
}

pub.timestampToSqlTime = function (timestamp) {
    let date = new Date(timestamp);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();

    return ((hours < 2) ? (hours + 10) : hours) + ":" + ((minutes == 0) ? "00" : minutes) + ":" + ((seconds == 0) ? "00" : seconds);
}

module.exports = pub;