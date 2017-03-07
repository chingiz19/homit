var router = require("express").Router();
var db = require("../db.js");
var tokenAPI = require("../token.js");
var bcrypt = require('bcrypt');
const saltRounds = 10;

router.post('/signup', function(req, res, next) {
    // var fname = req.body.fname;
    var fname = req.query.fname;
    var lname = req.query.lname;
    var email = req.query.email;
    var dob = req.query.dob;
    var password = req.query.password;
    var phone = req.query.phone;

    bcrypt.hash(password, saltRounds).then(function(hash) {
        var data = {
            user_email: email,
            first_name: fname,
            last_name: lname,
            password: hash,
            phone_number: phone
        };
        // check if the user already exists
        userExists(email).then(function(exists){
            if (exists) {
                var response = {success: 'false', error: 'duplicate email'};
                res.send(response);
            } else {
                var users_customers = "users_customers";
                db.insertQuery(users_customers, data).then(function(dbResult){
                    var userId = dbResult.insertId;
                    var token = tokenAPI.createToken(userId);
                    var response = {success: 'true', userid: userId, token: token};
                    res.send(response);
                });
            }
        });
    });
});

// router.get('/signin', function(req, res, next){
//     res.send("in the get wines");
// });

// router.get('/reset', function(req, res, next){
//     res.send("in the get wines");
// });

var userExists = function(email) {
    var users_customers = "users_customers";
    var data = {user_email: email};
    return db.selectQuery(users_customers, data).then(function(dbResult) {
        if (dbResult.length>0) {
            return true;
        } else {
            return false;
        }
    });
};



module.exports = router;