/**
 * @author Jeyhun Gurbanov, Zaman Zamanli
 * @copyright Homit 2017
 */

var mysql = require("promise-mysql");
var con;

/**
 * Database tables
 */
const dbTables = {
    users_customers : "users_customers",
    user_cart_info: "user_cart_info"
} 


/* MySQL Connection */
mysql.createConnection({
  host: "localhost",
  user: "delivery_user",
  password: "ahmadtea",
  database: "delivery_db"
}).then(function(connection){
  con = connection;
  console.log('Connection to DB established');
}).catch(function(err) {
  if (err){
    console.log('Error connecting to DB');
    return;
  }
});

var runQuery = function(query, data) {
  return con.query(query, data);
};

var insertQuery = function(table, data) {
  var tableName = table;
  return con.query('INSERT INTO '+tableName+' SET ?', data);
};

var selectAllWhere = function(table, data) {
  var tableName = table;
  return con.query('SELECT * FROM '+tableName+' WHERE ?', data);
};

var selectAllFromTable = function(table) {
  return con.query('SELECT * FROM '+table);
};

var updateQuery = function(table, data) {
  var tableName = table;
  return con.query('UPDATE '+tableName+' SET ? WHERE ?', data);
};

var deleteQuery = function(table, data) {
  var tableName = table;
  return con.query('DELETE FROM '+tableName+' WHERE ?', data);
};

var end = function(){
    con.end(function(err) {
        // The connection is terminated gracefully
        // Ensures all previously enqueued queries are still
        // before sending a COM_QUIT packet to the MySQL server.
        console.log("ended DB connection");
    });
};

module.exports.runQuery = runQuery;
module.exports.insertQuery = insertQuery;
module.exports.selectAllWhere = selectAllWhere;
module.exports.updateQuery = updateQuery;
module.exports.selectAllFromTable = selectAllFromTable;
module.exports.deleteQuery = deleteQuery;
module.exports.dbTables = dbTables;