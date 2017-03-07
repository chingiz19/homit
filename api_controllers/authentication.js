var router = require("express").Router();
var db = require("../db.js");

router.post('/signup', function(req, res, next) {
    var fname = req.query.fname;
    var lname = req.query.lname;
    var email = req.query.email;
    var dob = req.query.dob;
    var password = req.query.password;
    var phone = req.query.phone;
    var data = {
        user_email: email,
        first_name: fname,
        last_name: lname,
        password: password
    };
    // check if the user already exists
    if (userExists(email)) {
        console.log("in the i");
        var response = {success: 'false', error: 'duplicate email'};
        res.send(response);
    } else {
        console.log("in the else");
        var users_customers = "users_customers";
        db.insertQuery(users_customers, data).then(function(dbResult){
            var userId = dbResult.insertId;
            var response = {success: 'true', userid: userId, token: "tba"};
            res.send(response);
        });
    }
});

router.get('/signin', function(req, res, next){
    var email = req.query.email ? req.query.email : undefined;
    var password = req.query.password ? req.query.password : undefined;
    // double checking, this should be done on client-side as well through required field
    if (!email || !password){
        res.status(404).json({
            success: "false",
            error: "Missing email/password"
        });

        var query = "Select ..."; //TODO: insert query
        var args = [email, password];

        db.runQuery(query, args).then(function(result){
            //PSEUDOCODE
            // if good then 
            //      create token
            //      send back success, and assign session/token
            // else
            //      return not successful password/email
        });
        
    }
});

// router.get('/reset', function(req, res, next){
//     res.send("in the get wines");
// });

var userExists = function(email) {
    var users_customers = "users_customers";
    var data = {user_email: email};
    db.selectQuery(users_customers, data).then(function(dbResult) {
        // if dbResult > 0 return true
        // else return false
    });
    return true;
};



module.exports = router;