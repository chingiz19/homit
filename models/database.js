/**
 * @copyright Homit 2018
 */

var mysql = require("promise-mysql");
var con;

var pub = {};

/**
 * Database tables
 */
pub.tables = {
  catalog_store_types: "catalog_store_types",
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
  drivers_request: "drivers_request",
  orders_emails: "orders_emails",
  orders_transactions_history: "orders_transactions_history",
  stores_hours: "stores_hours",
  stores_authentication: "stores_authentication"
}

/**
 * Redis Database tables
 */
pub.redisTable = {
  io_drivers: 1,
  io_drivers: 3,
  io_cm: 5,
  sessions: 10
}

/*Building metadata for log*/
var logMeta = {
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
  Logger.log.debug('Connection to DB established', logMeta);
}).catch(function (err) {
  if (err) {
    var specMetaData = {
      directory: __filename,
      error_message: err.message
    }
    Logger.log.error('Error connecting to DB', specMetaData);
    return;
  }
});

/*Database query functions*/

pub.runQuery = function (query, data) {
  return con.query(query, data).then(function (result) {
    return result;
  }).catch(function (error) {
    var metadata = {
      directory: __filename,
      error_message: error.message
    }
    Logger.log.error('Could not run query', metadata);
    return error;
  });
};

pub.insertQuery = function (table, data) {
  return pub.runQuery('INSERT INTO ' + table + ' SET ?', data);
}

pub.selectColumnsWhereLimitOne = function (columns, table, data) {
  return pub.runQuery('SELECT ' + columns + ' FROM ' + table + ' WHERE ? LIMIT 1', data);
}

pub.selectAllWhere = function (table, data) {
  return pub.runQuery('SELECT * FROM ' + table + ' WHERE ?', data);
}

pub.selectAllWhere2 = function (table, data) {
  return pub.runQuery('SELECT * FROM ' + table + ' WHERE ? AND ?', data);
}

pub.selectAllFromTable = function (table) {
  return pub.runQuery('SELECT * FROM ' + table);
}

pub.updateQuery = function (table, data) {
  return pub.runQuery('UPDATE ' + table + ' SET ? WHERE ?', data);
}

pub.updateQueryWhereIn = function (table, data) {
  return pub.runQuery('UPDATE ' + table + ' SET ? WHERE ? in ?', data);
}

pub.deleteQuery = function (table, data) {
  return pub.runQuery('DELETE FROM ' + table + ' WHERE ?', data);
}

pub.deleteQuery2 = function (table, data) {
  return pub.runQuery('DELETE FROM ' + table + ' WHERE ? AND ?', data);
}

pub.selectAllWhereLimitOne = function (table, data) {
  return pub.runQuery('SELECT * FROM ' + table + ' WHERE ? LIMIT 1', data);
}

/**
 * Ends database connection in ethical/gracefull way, ensuring
 * all previously enqueued queries are still before sending
 * COM_QUIT packet to the MySQL server.
 */
var end = function () {
  con.end(function (err) {
    Logger.log.debug("Ended connection to DB.", logMeta);
  });
};

module.exports = pub;