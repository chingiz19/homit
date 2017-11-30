/**
 * @copyright Homit 2017
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
  user_cart_info: "user_cart_info"
}


/* MySQL Connection */
mysql.createConnection({
  host: "localhost",
  user: "db_admin",
  password: "ahmadtea",
  database: "homit"
}).then(function (connection) {
  con = connection;
  console.log('Connection to DB established');
}).catch(function (err) {
  if (err) {
    console.log(err);
    console.log('Error connecting to DB');
    return;
  }
});

var runQuery = function (query) {
  return con.query(query);
};

var runQuery = function (query, data) {
  return con.query(query, data);
};

var insertQuery = function (table, data) {
  var tableName = table;
  return con.query('INSERT INTO ' + tableName + ' SET ?', data);
};

var selectColumnsWhere = function(columns, table, data) {
  return con.query('SELECT ' + columns + ' FROM ' + table + ' WHERE ?', data);
};

var selectAllWhere = function (table, data) {
  var tableName = table;
  return con.query('SELECT * FROM ' + tableName + ' WHERE ?', data);
};

var selectAllFromTable = function (table) {
  return con.query('SELECT * FROM ' + table);
};

var updateQuery = function (table, data) {
  var tableName = table;
  return con.query('UPDATE ' + tableName + ' SET ? WHERE ?', data);
};

var updateQueryWhereIn = function (table, data) {
  var tableName = table;
  return con.query('UPDATE ' + tableName + ' SET ? WHERE ? in ?', data);
};

var deleteQuery = function (table, data) {
  var tableName = table;
  return con.query('DELETE FROM ' + tableName + ' WHERE ?', data);
};

var end = function () {
  con.end(function (err) {
    // The connection is terminated gracefully
    // Ensures all previously enqueued queries are still
    // before sending a COM_QUIT packet to the MySQL server.
    console.log("ended DB connection");
  });
};

module.exports.runQuery = runQuery;
module.exports.insertQuery = insertQuery;
module.exports.selectColumnsWhere = selectColumnsWhere;
module.exports.selectAllWhere = selectAllWhere;
module.exports.updateQuery = updateQuery;
module.exports.selectAllFromTable = selectAllFromTable;
module.exports.deleteQuery = deleteQuery;
module.exports.dbTables = dbTables;