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

    static init(){
        global.User = Users;
        global.db = Database;
        global.serverErrorHandler = ServerErrorHandler;
        global.Auth = Auth;
        global.Cart = Cart;
        global.Catalog = Catalog;
        global.Orders = Orders;
    }
}


module.exports = modelFactory;