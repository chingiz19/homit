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
        global.MP =             require("./models/money_processing");
        global.CSR =            require("./models/csr");
        global.Email =          require("./models/email");
        global.ErrorMessages =  require("./models/error_messages");
        global.NM =             require("./models/network_manager");
        global.Store =          require("./models/store");
        global.HelperUtils =    require("./models/helper_utils");
        global.Validator =      require("./models/validator");
        global.Scheduler =      require("./models/scheduler");
        global.Coupon =         require("./models/coupon");
        global.MDB=             require("./models/mongoDB");
        global.SITEMAP=         require("./models/sitemap_builder");
        global.BatchUploader=   require("./models/batch_product_uploader");

        global.ROOT_PATH = __dirname;

        if (process.env.n_mode == "production"){
            global.machineHostname = "https://www.homit.ca";
        } else {
            require('dns').lookup(require('os').hostname(), function (err, add, fam) {
                if(!add && err) {
                    add='localhost';
                }
                global.machineHostname = `http://${add}:8080`;
              });
        }
    }
}

module.exports = modelFactory;