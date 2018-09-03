/**
 * @copyright Homit 2018
 */

let mysql = require("promise-mysql");
let con;

let pub = {};

/*Building metadata for log*/
let logMeta = {
  directory: __filename
}

/* MySQL Connection */
mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
}).then(function (connection) {
  con = connection;
  MDB.mySQLConnected();
  Logger.log.debug('Connection to MySQL DB established', logMeta);
  if (process.env.n_mode != "production") {
    console.log('Connection to MySQL established');
  }
}).catch(function (err) {
  if (err) {
    let metadata = {
      directory: __filename,
      error_message: err.message
    }
    Logger.log.error('Error connecting to DB', metadata);
    throw new Error('Error connecting to DB');
  }
});

/**
 * Database tables
 */
pub.tables = {
  api_orders_history: "api_orders_history",
  catalog_store_types: "catalog_store_types",
  catalog_store_unions: "catalog_store_unions",
  catalog_stores: "catalog_stores",
  catalog_packaging_containers: "catalog_packaging_containers",
  catalog_packaging_volumes: "catalog_packaging_volumes",
  catalog_packaging_packagings: "catalog_packaging_packagings",
  catalog_description_names: "catalog_description_names",
  catalog_categories: "catalog_categories",
  catalog_subcategories: "catalog_subcategories",
  catalog_types: "catalog_types",
  catalog_listings: "catalog_listings",
  catalog_listings_descriptions: "catalog_listings_descriptions",
  catalog_products: "catalog_products",
  catalog_items: "catalog_items",
  catalog_depot: "catalog_depot",
  catalog_warehouse: "catalog_warehouse",
  catalog_coupons: "catalog_coupons",
  drivers: "drivers",
  drivers_shift_history: "drivers_shift_history",
  drivers_status: "drivers_status",
  drivers_routes: "drivers_routes",
  employee_roles: "employee_roles",
  orders_cart_items: "orders_cart_items",
  orders_history: "orders_history",
  users_customers: "users_customers",
  users_customers_guest: "users_customers_guest",
  users_customers_history: "users_customers_history",
  users_employees: "users_employees",
  user_cart_items: "user_cart_items",
  user_coupons: "user_coupons",
  orders_emails: "orders_emails",
  orders_transactions_history: "orders_transactions_history",
  stores_hours: "stores_hours",
  stores_authentication: "stores_authentication"
}

/**
 * Redis Database tables
 */
pub.redisTable = {
  io_external: 1,
  io_internal: 2,
  scheduler: 5,
  sessions: 10
}

/*Database query functions*/

pub.runQuery = function (query, data) {
  if (con) {
    return con.query(query, data).then(function (result) {
      return result;
    }).catch(function (error) {
      let metadata = {
        directory: __filename,
        error_message: error.message
      }
      if (process.env.n_mode == "production") {
        Logger.log.error('Could not run query', metadata);
      } else {
        console.log(error.message);
      }
      return false;
    });
  }
  return false;
};

pub.selectColumnsWhereLimitOne = function (columns, table, data) {
  return pub.runQuery('SELECT ' + columns + ' FROM ' + table + ' WHERE ? LIMIT 1', data);
}

pub.selectAllWhere = function (table, data) {
  return pub.runQuery('SELECT * FROM ' + table + ' WHERE ?', data);
}

pub.selectAllWhere2 = function (table, data) {
  return pub.runQuery('SELECT * FROM ' + table + ' WHERE ? AND ?', data);
}

pub.selectAllWhereLimitOne = function (table, data) {
  return pub.runQuery('SELECT * FROM ' + table + ' WHERE ? LIMIT 1', data);
}

pub.selectAllFromTable = function (table) {
  return pub.runQuery('SELECT * FROM ' + table);
}

pub.insertQuery = function (table, data) {
  return pub.runQuery('INSERT INTO ' + table + ' SET ?', data);
}

pub.updateQuery = function (table, data) {
  return pub.runQuery('UPDATE ' + table + ' SET ? WHERE ?', data);
}

pub.updateQueryWhereIn = function (table, data) {
  return pub.runQuery('UPDATE ' + table + ' SET ? WHERE ? in ?', data);
}

pub.updateQueryWhereAnd = function (table, data) {
  return pub.runQuery('UPDATE ' + table + ' SET ? WHERE ? AND ?', data);
}

pub.deleteQuery = function (table, data) {
  return pub.runQuery('DELETE FROM ' + table + ' WHERE ?', data);
}

pub.deleteQueryWithTwoCond = function (table, data) {
  return pub.runQuery('DELETE FROM ' + table + ' WHERE ? AND ?', data);
}

module.exports = pub;