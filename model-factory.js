/**
 * @copyright Homit 2018
 */


/**
 * This class uses initiator that 
 * initiates all models and saves 
 * them as global variable
 */
class modelFactory {

    static init(){
        global.User =           require("./models/users");
        global.db =             require("./models/database");
        global.Auth =           require("./models/authentication");
        global.Cart =           require("./models/cart");
        global.Catalog =        require("./models/catalog");
        global.Orders =         require("./models/orders");
        global.CM =             require("./models/chikimiki");
        global.Driver =         require("./models/driver");
        global.JWTToken =       require("./models/jwt_token");
        global.Logger =         require("./models/logger");
        global.SMS =            require("./models/SMS");
        global.MP =             require("./models/money-processing");
        global.CSR =            require("./models/csr");
        global.Email =          require("./models/email");
        global.ErrorMessages =  require("./models/error_messages");
        global.NM =             require("./models/network_manager");
        global.Store =          require("./models/store");
        global.HelperUtils =    require("./models/helper_utils");
        global.Validator =      require("./models/validator");
        global.Scheduler =      require("./models/scheduler");
        global.Coupon =         require("./models/coupon");

        if (process.env.n_mode == "production"){
            global.machineHostname = "https://www.homit.ca";
        } else {
            global.machineHostname = "http://192.168.0.1:8080";
        }
    }
}

module.exports = modelFactory;