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
        global.errorMessages =  require("./models/error_messages");
        global.NM =             require("./models/network_manager");
    }
}

module.exports = modelFactory;