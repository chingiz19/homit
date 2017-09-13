/**
 * @author Jeyhun Gurbanov
 * @copyright Homit
 */

var Users               = require("./models/users");
var Orders              = require("./models/orders");
var Cart                = require("./models/cart");
var Catalog             = require("./models/catalog");
var ServerErrorHandler  = require("./models/server-error-handler");
var Database            = require("./models/database");
var Auth                = require("./models/authentication");


/**
 * This class uses 
 */
class modelFactory {

    static initializeUsers(){
        return Users;
    }

    static initializeOrders(){
        return Orders;
    }

    static initializeCart(){
        return Cart;
    }

    static initializeCatalog(){
        return Catolog;
    }

    static initializeServerErrorHandler(){
        return ServerErrorHandler;
    }

    static initializeDatabase(){
        return Database;
    }

    static initializeAuthentication(){
        return Auth;
    }
}


module.exports = modelFactory;