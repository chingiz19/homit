/**
 * @copyright Homit 2018
 */

var mysql = require("promise-mysql");
var con;

/**
 * Database tables
 */
const dbTables = {
  catalog_categories: "catalog_categories",
  catalog_containers: "catalog_containers",
  catalog_depot: "catalog_depot",
  catalog_stores: "catalog_stores",
  catalog_listings: "catalog_listings",
  catalog_packagings: "catalog_packagings",
  catalog_packaging_volumes: "catalog_packaging_volumes",
  catalog_products: "catalog_products",
  catalog_subcategories: "catalog_subcategories",
  catalog_super_categories: "catalog_super_categories",
  catalog_types: "catalog_types",
  drivers: "drivers",
  drivers_shift_history: "drivers_shift_history",
  drivers_location: "drivers_location",
  drivers_routes: "drivers_routes",
  employee_roles: "employee_roles",
  orders_cart_info: "orders_cart_info",
  orders_history: "orders_history",
  users_customers: "users_customers",
  users_customers_guest: "users_customers_guest",
  users_customers_history: "users_customers_history",
  users_employees: "users_employees",
  user_cart_info: "user_cart_info",
  csr_actions: "csr_actions",
  orders_history_refund: "orders_history_refund",
  orders_history_cancel: "orders_history_cancel",
  orders_history_add: "orders_history_add"
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

var runQuery = function (query, data) {
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

var insertQuery = function (table, data) {
  return runQuery('INSERT INTO ' + table + ' SET ?', data);
};

var selectColumnsWhere = function (columns, table, data) {
  return runQuery('SELECT ' + columns + ' FROM ' + table + ' WHERE ?', data);
};

var selectAllWhere = function (table, data) {
  return runQuery('SELECT * FROM ' + table + ' WHERE ?', data);
};

var selectAllWhere2 = function (table, data) {
  return runQuery('SELECT * FROM ' + table + ' WHERE ? AND ?', data);
};

var selectAllFromTable = function (table) {
  return runQuery('SELECT * FROM ' + table);
};

var updateQuery = function (table, data) {
  return runQuery('UPDATE ' + table + ' SET ? WHERE ?', data);
};

var updateQueryWhereIn = function (table, data) {
  return runQuery('UPDATE ' + table + ' SET ? WHERE ? in ?', data);
};

var deleteQuery = function (table, data) {
  return runQuery('DELETE FROM ' + table + ' WHERE ?', data);
};

var deleteQuery2 = function (table, data) {
  return runQuery('DELETE FROM ' + table + ' WHERE ? AND ?', data);
};

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

module.exports.runQuery = runQuery;
module.exports.insertQuery = insertQuery;
module.exports.selectColumnsWhere = selectColumnsWhere;
module.exports.selectAllWhere = selectAllWhere;
module.exports.selectAllWhere2 = selectAllWhere2;
module.exports.updateQuery = updateQuery;
module.exports.selectAllFromTable = selectAllFromTable;
module.exports.deleteQuery = deleteQuery;
module.exports.deleteQuery2 = deleteQuery2;
module.exports.dbTables = dbTables;