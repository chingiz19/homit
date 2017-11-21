/**
 * @copyright Homit
 */

var Users               = require("./models/users");
var Orders              = require("./models/orders");
var Cart                = require("./models/cart");
var Catalog             = require("./models/catalog");
var ServerErrorHandler  = require("./models/server-error-handler");
var Database            = require("./models/database");
var Auth                = require("./models/authentication");
var ChikiMiki           = require("./models/chikimiki");
var Driver              = require("./models/driver");


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
        global.CM = ChikiMiki;
        global.Driver = Driver;
    }
}


module.exports = modelFactory;