/**
 * Unit tests for Database structure
 * @author Jeyhun Gurbanov
 */

var dotenv = require("dotenv");
dotenv.config({path: "test.env"});

var expect = require("chai").expect;
var path = require("path");
// var userModel = require("/models/users.js");
global.db = require(path.join(process.cwd(), "/models/database.js"));
global.Logger = require(path.join(process.cwd(), "/models/logger.js"));

describe("Database structure unit tests", function(){

    /**
     * Before tests method
     * Setup DB for tests
     */
    before(function(done){
        // wait for db connection
        setTimeout(function(){
                done();                            
        }, 1000);
    });

    it("Check database tables", async function(){
        let tables = await db.runQuery("Show tables;");
        expect(tables.length).to.equal(27);
    });

    it("Check catalog_categories table structure", async function(){
        let expected = {
            "id": {
                "Key": "PRI",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "display_name": {
                "Key": "",
                "Null": "NO",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            },
            "name": {
                "Key": "",
                "Null": "NO",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            },
            "super_category_id": {
                "Key": "MUL",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            }
        };

        let table_structure = await db.runQuery("Describe catalog_categories");        
        let actual = convertTableStructureToMap(table_structure);

        expect(actual).to.own.deep.equal(expected);            
    });

    it("Check catalog_containers table structure", async function(){
        let expected = {
            "id": {
                "Key": "PRI",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "name": {
                "Key": "",
                "Null": "NO",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            }
        };

        let table_structure = await db.runQuery("Describe catalog_containers");        
        let actual = convertTableStructureToMap(table_structure);

        expect(actual).to.own.deep.equal(expected);            
    });

    it("Check catalog_depot table structure", async function(){
        let expected = {
            "id": {
                "Key": "PRI",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "product_id": {
                "Key": "MUL",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "packaging_id": {
                "Key": "MUL",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "packaging_volume_id": {
                "Key": "MUL",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "price": {
                "Key": "",
                "Null": "NO",
                "Type": "decimal(6,2)",
                "Default": null,
                "Extra": ""
            },
            "quantity": {
                "Key": "",
                "Null": "YES",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "tax": {
                "Key": "",
                "Null": "YES",
                "Type": "tinyint(1)",
                "Default": "1",
                "Extra": ""
            }
        };

        let table_structure = await db.runQuery("Describe catalog_depot");        
        let actual = convertTableStructureToMap(table_structure);

        expect(actual).to.own.deep.equal(expected);            
    });

    it("Check catalog_listings table structure", async function(){
        let expected = {
            "id": {
                "Key": "PRI",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "product_brand": {
                "Key": "",
                "Null": "YES",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            },
            "product_name": {
                "Key": "",
                "Null": "YES",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            },
            "product_description": {
                "Key": "",
                "Null": "YES",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            },
            "product_country": {
                "Key": "",
                "Null": "YES",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            },
            "type_id": {
                "Key": "MUL",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            }
        };

        let table_structure = await db.runQuery("Describe catalog_listings");        
        let actual = convertTableStructureToMap(table_structure);

        expect(actual).to.own.deep.equal(expected);            
    });

    it("Check catalog_packagings table structure", async function(){
        let expected = {
            "id": {
                "Key": "PRI",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "name": {
                "Key": "",
                "Null": "NO",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            }
        };

        let table_structure = await db.runQuery("Describe catalog_packagings");        
        let actual = convertTableStructureToMap(table_structure);

        expect(actual).to.own.deep.equal(expected);            
    });

    it("Check catalog_packaging_volumes table structure", async function(){
        let expected = {
            "id": {
                "Key": "PRI",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "volume_name": {
                "Key": "",
                "Null": "NO",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            }
        };

        let table_structure = await db.runQuery("Describe catalog_packaging_volumes");        
        let actual = convertTableStructureToMap(table_structure);

        expect(actual).to.own.deep.equal(expected);            
    });

    it("Check catalog_stores table structure", async function(){
        let expected = {
            "id": {
                "Key": "PRI",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": "auto_increment"
            },
            "id_prefix": {
                "Key": "",
                "Null": "NO",
                "Type": "varchar(3)",
                "Default": "s_",
                "Extra": ""
            },
            "name": {
                "Key": "",
                "Null": "NO",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            },
            "address": {
                "Key": "",
                "Null": "NO",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            },
            "address_latitude": {
                "Key": "",
                "Null": "NO",
                "Type": "double",
                "Default": null,
                "Extra": ""
            },
            "address_longitude": {
                "Key": "",
                "Null": "NO",
                "Type": "double",
                "Default": null,
                "Extra": ""
            },
            "phone_number": {
                "Key": "",
                "Null": "YES",
                "Type": "varchar(10)",
                "Default": null,
                "Extra": ""
            },
            "store_type": {
                "Key": "MUL",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "open_time": {
                "Key": "",
                "Null": "YES",
                "Type": "time",
                "Default": null,
                "Extra": ""
            },
            "close_time": {
                "Key": "",
                "Null": "YES",
                "Type": "time",
                "Default": null,
                "Extra": ""
            },
            "open_time_next": {
                "Key": "",
                "Null": "YES",
                "Type": "time",
                "Default": null,
                "Extra": ""
            },
            "close_time_next": {
                "Key": "",
                "Null": "YES",
                "Type": "time",
                "Default": null,
                "Extra": ""
            }
        };

        let table_structure = await db.runQuery("Describe catalog_stores");        
        let actual = convertTableStructureToMap(table_structure);

        expect(actual).to.own.deep.equal(expected);            
    });

    it("Check catalog_subcategories table structure", async function(){
        let expected = {
            "id": {
                "Key": "PRI",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "name": {
                "Key": "",
                "Null": "NO",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            },
            "category_id": {
                "Key": "MUL",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            }
        };

        let table_structure = await db.runQuery("Describe catalog_subcategories");        
        let actual = convertTableStructureToMap(table_structure);

        expect(actual).to.own.deep.equal(expected);            
    });

    it("Check catalog_super_categories table structure", async function(){
        let expected = {
            "id": {
                "Key": "PRI",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "name": {
                "Key": "",
                "Null": "NO",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            },
            "display_name": {
                "Key": "",
                "Null": "NO",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            }
        };

        let table_structure = await db.runQuery("Describe catalog_super_categories");        
        let actual = convertTableStructureToMap(table_structure);

        expect(actual).to.own.deep.equal(expected);            
    });

    it("Check catalog_types table structure", async function(){
        let expected = {
            "id": {
                "Key": "PRI",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "name": {
                "Key": "",
                "Null": "NO",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            },
            "subcategory_id": {
                "Key": "MUL",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            }
        };

        let table_structure = await db.runQuery("Describe catalog_types");        
        let actual = convertTableStructureToMap(table_structure);

        expect(actual).to.own.deep.equal(expected);            
    });

    it("Check csr_actions table structure", async function(){
        let expected = {
            "id": {
                "Key": "PRI",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": "auto_increment"
            },
            "csr_id": {
                "Key": "MUL",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "note": {
                "Key": "",
                "Null": "YES",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            }
        };

        let table_structure = await db.runQuery("Describe csr_actions");        
        let actual = convertTableStructureToMap(table_structure);

        expect(actual).to.own.deep.equal(expected);            
    });

    it("Check drivers table structure", async function(){
        let expected = {
            "id": {
                "Key": "PRI",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": "auto_increment"
            },
            "id_prefix": {
                "Key": "",
                "Null": "NO",
                "Type": "varchar(3)",
                "Default": "d_",
                "Extra": ""
            },
            "employee_id": {
                "Key": "UNI",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            }
        };

        let table_structure = await db.runQuery("Describe drivers");        
        let actual = convertTableStructureToMap(table_structure);

        expect(actual).to.own.deep.equal(expected);            
    });

    it("Check drivers_location table structure", async function(){
        let expected = {
            "id": {
                "Key": "PRI",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": "auto_increment"
            },
            "driver_id": {
                "Key": "MUL",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "latitude": {
                "Key": "",
                "Null": "YES",
                "Type": "double",
                "Default": null,
                "Extra": ""
            },
            "longitude": {
                "Key": "",
                "Null": "YES",
                "Type": "double",
                "Default": null,
                "Extra": ""
            }
        };

        let table_structure = await db.runQuery("Describe drivers_location");        
        let actual = convertTableStructureToMap(table_structure);

        expect(actual).to.own.deep.equal(expected);            
    });

    it("Check drivers_routes table structure", async function(){
        let expected = {
            "id": {
                "Key": "PRI",
                "Null": "NO",
                "Type": "int(10) unsigned",
                "Default": null,
                "Extra": "auto_increment"
            },
            "driver_id": {
                "Key": "MUL",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "store_id": {
                "Key": "MUL",
                "Null": "YES",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "order_id": {
                "Key": "MUL",
                "Null": "YES",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "position": {
                "Key": "",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            }
        };

        let table_structure = await db.runQuery("Describe drivers_routes");        
        let actual = convertTableStructureToMap(table_structure);

        expect(actual).to.own.deep.equal(expected);            
    });

    it("Check drivers_shift_history table structure", async function(){
        let expected = {
            "id": {
                "Key": "PRI",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": "auto_increment"
            },
            "driver_id": {
                "Key": "MUL",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "shift_start": {
                "Key": "",
                "Null": "NO",
                "Type": "timestamp",
                "Default": "CURRENT_TIMESTAMP",
                "Extra": ""
            },
            "shift_end": {
                "Key": "",
                "Null": "YES",
                "Type": "timestamp",
                "Default": null,
                "Extra": ""
            },
            "online": {
                "Key": "",
                "Null": "YES",
                "Type": "tinyint(1)",
                "Default": "1",
                "Extra": ""
            }
        };

        let table_structure = await db.runQuery("Describe drivers_shift_history");        
        let actual = convertTableStructureToMap(table_structure);

        expect(actual).to.own.deep.equal(expected);            
    });

    it("Check employee_roles table structure", async function(){
        let expected = {
            "id": {
                "Key": "PRI",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "role": {
                "Key": "UNI",
                "Null": "NO",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            }
        };

        let table_structure = await db.runQuery("Describe employee_roles");        
        let actual = convertTableStructureToMap(table_structure);

        expect(actual).to.own.deep.equal(expected);            
    });

    it("Check orders_cart_info table structure", async function(){
        let expected = {
            "id": {
                "Key": "PRI",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": "auto_increment"
            },
            "order_id": {
                "Key": "MUL",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "depot_id": {
                "Key": "MUL",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "quantity": {
                "Key": "",
                "Null": "NO",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            },
            "price_sold": {
                "Key": "",
                "Null": "NO",
                "Type": "decimal(6,2)",
                "Default": null,
                "Extra": ""
            },
            "modified_quantity": {
                "Key": "",
                "Null": "YES",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "tax": {
                "Key": "",
                "Null": "NO",
                "Type": "tinyint(1)",
                "Default": null,
                "Extra": ""
            }
        };

        let table_structure = await db.runQuery("Describe orders_cart_info");        
        let actual = convertTableStructureToMap(table_structure);

        expect(actual).to.own.deep.equal(expected);            
    });

    it("Check orders_history table structure", async function(){
        let expected = {
            "id": {
                "Key": "PRI",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": "auto_increment"
            },
            "id_prefix": {
                "Key": "",
                "Null": "NO",
                "Type": "varchar(3)",
                "Default": "o_",
                "Extra": ""
            },
            "user_id": {
                "Key": "MUL",
                "Null": "YES",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "guest_id": {
                "Key": "MUL",
                "Null": "YES",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "transaction_id": {
                "Key": "",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "date_placed": {
                "Key": "",
                "Null": "NO",
                "Type": "timestamp",
                "Default": "CURRENT_TIMESTAMP",
                "Extra": ""
            },
            "date_assigned": {
                "Key": "",
                "Null": "YES",
                "Type": "timestamp",
                "Default": null,
                "Extra": ""
            },
            "date_arrived_store": {
                "Key": "",
                "Null": "YES",
                "Type": "timestamp",
                "Default": null,
                "Extra": ""
            },
            "date_picked": {
                "Key": "",
                "Null": "YES",
                "Type": "timestamp",
                "Default": null,
                "Extra": ""
            },
            "date_arrived_customer": {
                "Key": "",
                "Null": "YES",
                "Type": "timestamp",
                "Default": null,
                "Extra": ""
            },
            "date_delivered": {
                "Key": "",
                "Null": "YES",
                "Type": "timestamp",
                "Default": null,
                "Extra": ""
            },
            "delivery_address": {
                "Key": "",
                "Null": "NO",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            },
            "delivery_latitude": {
                "Key": "",
                "Null": "NO",
                "Type": "double",
                "Default": null,
                "Extra": ""
            },
            "delivery_longitude": {
                "Key": "",
                "Null": "NO",
                "Type": "double",
                "Default": null,
                "Extra": ""
            },
            "store_type": {
                "Key": "MUL",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "store_id": {
                "Key": "MUL",
                "Null": "YES",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "driver_id": {
                "Key": "MUL",
                "Null": "YES",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "refused": {
                "Key": "",
                "Null": "YES",
                "Type": "tinyint(1)",
                "Default": null,
                "Extra": ""
            },
            "receiver_name": {
                "Key": "",
                "Null": "YES",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            },
            "receiver_age": {
                "Key": "",
                "Null": "YES",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            }
        };

        let table_structure = await db.runQuery("Describe orders_history");        
        let actual = convertTableStructureToMap(table_structure);

        expect(actual).to.own.deep.equal(expected);            
    });

    it("Check orders_history_add table structure", async function(){
        let expected = {
            "id": {
                "Key": "PRI",
                "Null": "NO",
                "Type": "int(10) unsigned",
                "Default": null,
                "Extra": "auto_increment"
            },
            "order_id": {
                "Key": "MUL",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "csr_action_id": {
                "Key": "MUL",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "charge_amount": {
                "Key": "",
                "Null": "YES",
                "Type": "decimal(6,2)",
                "Default": null,
                "Extra": ""
            }
        };

        let table_structure = await db.runQuery("Describe orders_history_add");        
        let actual = convertTableStructureToMap(table_structure);

        expect(actual).to.own.deep.equal(expected);            
    });

    it("Check orders_history_cancel table structure", async function(){
        let expected = {
            "id": {
                "Key": "PRI",
                "Null": "NO",
                "Type": "int(10) unsigned",
                "Default": null,
                "Extra": "auto_increment"
            },
            "order_id": {
                "Key": "MUL",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "csr_action_id": {
                "Key": "MUL",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "transaction_id": {
                "Key": "",
                "Null": "YES",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "refund_amount": {
                "Key": "",
                "Null": "YES",
                "Type": "decimal(6,2)",
                "Default": null,
                "Extra": ""
            },
            "date_placed": {
                "Key": "",
                "Null": "NO",
                "Type": "timestamp",
                "Default": "CURRENT_TIMESTAMP",
                "Extra": ""
            },
            "date_refunded": {
                "Key": "",
                "Null": "YES",
                "Type": "timestamp",
                "Default": null,
                "Extra": ""
            }
        };

        let table_structure = await db.runQuery("Describe orders_history_cancel");        
        let actual = convertTableStructureToMap(table_structure);

        expect(actual).to.own.deep.equal(expected);            
    });

    it("Check orders_history_refund table structure", async function(){
        let expected = {
            "id": {
                "Key": "PRI",
                "Null": "NO",
                "Type": "int(10) unsigned",
                "Default": null,
                "Extra": "auto_increment"
            },
            "order_id": {
                "Key": "MUL",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "csr_action_id": {
                "Key": "MUL",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "transaction_id": {
                "Key": "",
                "Null": "YES",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "refund_amount": {
                "Key": "",
                "Null": "YES",
                "Type": "decimal(6,2)",
                "Default": null,
                "Extra": ""
            },
            "date_placed": {
                "Key": "",
                "Null": "NO",
                "Type": "timestamp",
                "Default": "CURRENT_TIMESTAMP",
                "Extra": ""
            },
            "date_picked": {
                "Key": "",
                "Null": "YES",
                "Type": "timestamp",
                "Default": null,
                "Extra": ""
            },
            "date_refunded": {
                "Key": "",
                "Null": "YES",
                "Type": "timestamp",
                "Default": null,
                "Extra": ""
            },
            "driver_id": {
                "Key": "MUL",
                "Null": "YES",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "date_scheduled": {
                "Key": "",
                "Null": "YES",
                "Type": "timestamp",
                "Default": null,
                "Extra": ""
            },
            "date_scheduled_note": {
                "Key": "",
                "Null": "YES",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            }
        };

        let table_structure = await db.runQuery("Describe orders_history_refund");        
        let actual = convertTableStructureToMap(table_structure);

        expect(actual).to.own.deep.equal(expected);            
    });

    it("Check users_customers table structure", async function(){
        let expected = {
            "id": {
                "Key": "PRI",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": "auto_increment"
            },
            "id_prefix": {
                "Key": "",
                "Null": "NO",
                "Type": "varchar(3)",
                "Default": "u_",
                "Extra": ""
            },
            "user_email": {
                "Key": "UNI",
                "Null": "NO",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            },
            "first_name": {
                "Key": "",
                "Null": "NO",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            },
            "last_name": {
                "Key": "",
                "Null": "NO",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            },
            "password": {
                "Key": "",
                "Null": "NO",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            },
            "phone_number": {
                "Key": "",
                "Null": "YES",
                "Type": "varchar(10)",
                "Default": null,
                "Extra": ""
            },
            "birth_date": {
                "Key": "",
                "Null": "YES",
                "Type": "date",
                "Default": null,
                "Extra": ""
            },
            "address1": {
                "Key": "",
                "Null": "YES",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            },
            "address1_name": {
                "Key": "",
                "Null": "YES",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            },
            "address1_latitude": {
                "Key": "",
                "Null": "YES",
                "Type": "double",
                "Default": null,
                "Extra": ""
            },
            "address1_longitude": {
                "Key": "",
                "Null": "YES",
                "Type": "double",
                "Default": null,
                "Extra": ""
            },
            "card_token": {
                "Key": "",
                "Null": "YES",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            },
            "card_type": {
                "Key": "",
                "Null": "YES",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            },
            "card_digits": {
                "Key": "",
                "Null": "YES",
                "Type": "varchar(4)",
                "Default": null,
                "Extra": ""
            }
        };

        let table_structure = await db.runQuery("Describe users_customers");        
        let actual = convertTableStructureToMap(table_structure);

        expect(actual).to.own.deep.equal(expected);            
    });

    it("Check users_customers_guest table structure", async function(){
        let expected = {
            "id": {
                "Key": "PRI",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": "auto_increment"
            },
            "id_prefix": {
                "Key": "",
                "Null": "NO",
                "Type": "varchar(3)",
                "Default": "g_",
                "Extra": ""
            },
            "user_email": {
                "Key": "UNI",
                "Null": "NO",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            },
            "first_name": {
                "Key": "",
                "Null": "NO",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            },
            "last_name": {
                "Key": "",
                "Null": "NO",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            },
            "phone_number": {
                "Key": "",
                "Null": "NO",
                "Type": "varchar(10)",
                "Default": null,
                "Extra": ""
            },
            "birth_date": {
                "Key": "",
                "Null": "YES",
                "Type": "date",
                "Default": null,
                "Extra": ""
            }
        };

        let table_structure = await db.runQuery("Describe users_customers_guest");        
        let actual = convertTableStructureToMap(table_structure);

        expect(actual).to.own.deep.equal(expected);            
    });

    it("Check users_customers_history table structure", async function(){
        let expected = {
            "id": {
                "Key": "PRI",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": "auto_increment"
            },
            "user_id": {
                "Key": "MUL",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "user_email": {
                "Key": "",
                "Null": "YES",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            },
            "first_name": {
                "Key": "",
                "Null": "YES",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            },
            "last_name": {
                "Key": "",
                "Null": "YES",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            },
            "phone_number": {
                "Key": "",
                "Null": "YES",
                "Type": "varchar(10)",
                "Default": null,
                "Extra": ""
            },
            "birth_date": {
                "Key": "",
                "Null": "YES",
                "Type": "date",
                "Default": null,
                "Extra": ""
            },
            "address1": {
                "Key": "",
                "Null": "YES",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            },
            "address1_name": {
                "Key": "",
                "Null": "YES",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            },
            "address1_latitude": {
                "Key": "",
                "Null": "YES",
                "Type": "double",
                "Default": null,
                "Extra": ""
            },
            "address1_longitude": {
                "Key": "",
                "Null": "YES",
                "Type": "double",
                "Default": null,
                "Extra": ""
            }
        };

        let table_structure = await db.runQuery("Describe users_customers_history");        
        let actual = convertTableStructureToMap(table_structure);

        expect(actual).to.own.deep.equal(expected);            
    });

    it("Check users_employees table structure", async function(){
        let expected = {
            "id": {
                "Key": "PRI",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": "auto_increment"
            },
            "user_email": {
                "Key": "UNI",
                "Null": "NO",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            },
            "first_name": {
                "Key": "",
                "Null": "NO",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            },
            "last_name": {
                "Key": "",
                "Null": "NO",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            },
            "password": {
                "Key": "",
                "Null": "NO",
                "Type": "varchar(225)",
                "Default": null,
                "Extra": ""
            },
            "sin_number": {
                "Key": "",
                "Null": "YES",
                "Type": "varchar(9)",
                "Default": null,
                "Extra": ""
            },
            "phone_number": {
                "Key": "",
                "Null": "YES",
                "Type": "varchar(10)",
                "Default": null,
                "Extra": ""
            },
            "role_id": {
                "Key": "MUL",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            }
        };

        let table_structure = await db.runQuery("Describe users_employees");        
        let actual = convertTableStructureToMap(table_structure);

        expect(actual).to.own.deep.equal(expected);            
    });

    it("Check user_cart_info table structure", async function(){
        let expected = {
            "id": {
                "Key": "PRI",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": "auto_increment"
            },
            "user_id": {
                "Key": "MUL",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "depot_id": {
                "Key": "MUL",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            },
            "quantity": {
                "Key": "",
                "Null": "NO",
                "Type": "int(11)",
                "Default": null,
                "Extra": ""
            }
        };

        let table_structure = await db.runQuery("Describe user_cart_info");        
        let actual = convertTableStructureToMap(table_structure);

        expect(actual).to.own.deep.equal(expected);            
    });

    /* Helper functions */

    function convertTableStructureToMap(table){
        let objHolder = {};
        for (let i = 0; i < table.length; i++){
            let key = table[i].Field;
            delete table[i].Field;
            objHolder[key] = table[i];
        }
        return objHolder;
    }
});