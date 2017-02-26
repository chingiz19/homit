var mysql = require("mysql");

/* MySQL Connection */
var con = mysql.createConnection({
  host: "localhost",
  user: "delivery_user",
  password: "ahmadtea"
});

con.connect(function(err){
  if(err){
    console.log('Error connecting to DB');
    return;
  }
  console.log('Connection to DB established');
});

var runQuery = function(query, args){

};

var end = function(){
    con.end(function(err) {
        // The connection is terminated gracefully
        // Ensures all previously enqueued queries are still
        // before sending a COM_QUIT packet to the MySQL server.
        console.log("ended connection mazafaka");
    });
}

module.exports = runQuery;