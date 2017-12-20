/**
 * @copyright Homit 2017 
 */

var Users               = require("./models/users");
var Orders              = require("./models/orders");
var Cart                = require("./models/cart");
var Catalog             = require("./models/catalog");
var Database            = require("./models/database");
var Auth                = require("./models/authentication");
var ChikiMiki           = require("./models/chikimiki");
var Driver              = require("./models/driver");
var JWTToken            = require("./models/jwt_token");
var Logger              = require("./models/logger");
var SMS                 = require("./models/SMS");
var MP                  = require("./models/money-processing");
var Email               = require("./models/email");

/**
 * This class uses 
 */
class modelFactory {

    static init(){
        global.User = Users;
        global.db = Database;
        global.Auth = Auth;
        global.Cart = Cart;
        global.Catalog = Catalog;
        global.Orders = Orders;
        global.CM = ChikiMiki;
        global.Driver = Driver;
        global.JWTToken = JWTToken;
        global.Logger = Logger;
        global.SMS = SMS;
        global.MP = MP;
        global.Email = Email;
    }
}


module.exports = modelFactory;