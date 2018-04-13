/**
 * @copyright Homit 2018
 * Add all helpers that could be shared among models here.
 */

var pub = {};

/**
 * Takes Object and checks that invalid params(e.g typos in name, unexpected) params do not exist
 * 
 * @param {*} obj - object to check/validate againsts
 * @param {*} validParams - all valid params that might be in obj
 */
pub.hasInvalidParams = function(obj, validParams){
    if (!obj) return false;

    var clone = Object.assign({}, obj);

    for (let param of validParams){
        delete clone[param];
    }

    return (Object.keys(clone) != 0); 

}

module.exports = pub;