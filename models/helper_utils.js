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
 * Options for validParams:
 *          isRemovable: boolean - Allows field/column to be removed from Database. If set will convert params equal 'remove' to undefined. This is required to remove from db
 * 
 */
pub.validateParams = function(obj, validParams){
    if (!obj) return false;

    var clone = Object.assign({}, obj);

    for (let param in validParams){
        if (validParams[param].isRemovable && obj[param] == 'remove'){
            obj[param] = undefined;
        }
        delete clone[param];
    }

    if (Object.keys(clone) != 0){
        return false;
    } else {
        return obj; 
    }

}

module.exports = pub;