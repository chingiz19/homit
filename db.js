var mysql = require("promise-mysql");
var con;

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

var runQuery = function(query, args){
  console.log("in the runquery");
  con.query(query);
  return "success";
  //   con.query('INSERT INTO '+tableName+' SET ?', data, function(err, res){
  //   zurna = res.insertId;
  //   console.log(res.insertId);
  // });
};

var insertQuery = function(table, data) {
  var tableName = table;
  return con.query('INSERT INTO '+tableName+' SET ?', data);
};

var end = function(){
    con.end(function(err) {
        // The connection is terminated gracefully
        // Ensures all previously enqueued queries are still
        // before sending a COM_QUIT packet to the MySQL server.
        console.log("ended DB connection");
    });
}

module.exports.runQuery = runQuery;
module.exports.insertQuery = insertQuery;
