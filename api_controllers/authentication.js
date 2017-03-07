var router = require("express").Router();
var db = require("../db.js");
var tokenAPI = require("../token.js");
var bcrypt = require('bcrypt');
const saltRounds = 10;

router.post('/signup', function(req, res, next) {
    // var fname = req.body.fname; // might use this tecnhique later
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
            if (!exists) {
                var users_customers = "users_customers";
                db.insertQuery(users_customers, data).then(function(dbResult){
                    var user = {
                        id: dbResult.insertId,
                        user_email: data['user_email'],
                        first_name: data['first_name'],
                        last_name: data['last_name'],
                        phone_number: data['phone_number']
                    };
                    var token = tokenAPI.createToken(dbResult.insertId);
                    var response = {success: 'true', user: user, token: token};
                    res.send(response);
                });
            } else {
                var response = {success: 'false', error: 'duplicate email'};
                res.send(response);
            }
        });
    });
});

router.get('/signin', function(req, res, next){
    var email = req.query.email ? req.query.email : undefined;
    var password = req.query.password ? req.query.password : undefined;
    // double checking, this should be done on client-side as well through required field
    if (!email || !password){
        res.status(403).json({
            success: "false",
            error: "Missing email/password"
        });
    } else {
        userExists(email).then(function(exists){
            if (!exists) {
                var response = {success: 'false', error: 'user does not exist'};
                res.send(response);
            } else {
                bcrypt.compare(password, exists['password']).then(function(match) {
                    if (!match) {
                        var response = {success: 'false', error: 'wrong password'};
                        res.send(response);
                    } else {
                        var user = {
                            id: exists['id'],
                            user_email: exists['user_email'],
                            first_name: exists['first_name'],
                            last_name: exists['last_name'],
                            phone_number: exists['phone_number']
                        };
                        var token = tokenAPI.createToken(exists['id']);
                        var response = {success: 'true', user: user, token: token};
                        res.send(response);
                    }
                });
            }
        });
    }
});

// router.get('/reset', function(req, res, next){
//     res.send("in the get wines");
// });

var userExists = function(email) {
    var users_customers = "users_customers";
    var data = {user_email: email};
    return db.selectQuery(users_customers, data).then(function(dbResult) {
        if (dbResult.length>0) {
            return dbResult[0];
        } else {
            return false;
        }
    });
};



module.exports = router;