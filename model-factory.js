/**
 * @author Jeyhun Gurbanov
 * @copyright Homit
 */

var Users               = require("./models/Users");
var Orders              = require("./models/Orders");
var Cart                = require("./models/Cart");
var Catalog             = require("./models/Catalog");
var ServerErrorHandler  = require("./models/server-error-handler");
var Database            = require("./models/Database");


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
}


module.exports = modelFactory;