var router = require("express").Router();
var db = require("../db.js");
var tokenAPI = require("../token.js");
var bcrypt = require('bcrypt');
const saltRounds = 10;

// router.use(global.checkAuth);


router.get('/userexists', function(req, res, next){
    var email = req.query.email;
    if (!email){
        res.status(403).json({
            success: "false",
            error: "missing email"
        });
    } else {
        userExists(email).then(function(exists){
            if (!exists) {
                var response = {success: 'false', error: 'user does not exist'};
                res.send(response);
            } else {
                var response = {success: 'true', error: 'user exists'};
                res.send(response);
            }
        });
    }
});


router.post('/signup', function(req, res, next) {
    // var fname = req.body.fname; // might use this tecnhique later
    var fname = req.query.fname;
    var lname = req.query.lname;
    var email = req.query.email;
    var dob = req.query.dob;
    var password = req.query.password;
    var phone = req.query.phone;

    if (!fname || !lname || !email || !dob || !password || !phone) {
        res.status(403).json({
            success: "false",
            error: "missing one or more fields"
        });
    } else {
        bcrypt.hash(password, saltRounds).then(function(hash) {
            var data = {
                user_email: email,
                first_name: fname,
                last_name: lname,
                password: hash,
                phone_number: phone
            };
            // check if the user already exists
            userExists(email).then(function(exists) {
                if (!exists) {
                    var users_customers = "users_customers";
                    db.insertQuery(users_customers, data).then(function(dbResult) {
                        var user = {
                            id: dbResult.insertId,
                            user_email: data['user_email'],
                            first_name: data['first_name'],
                            last_name: data['last_name'],
                            phone_number: data['phone_number']
                        };
                        req.session.user = user;
                        var response = {
                            success: 'true',
                            user: user
                        };
                        res.send(response);
                    });
                } else {
                    var response = {
                        success: 'false',
                        error: 'duplicate email'
                    };
                    res.send(response);
                }
            });
        });
    }
});

router.get('/signin', function(req, res, next){
    var email = req.query.email ? req.query.email : undefined;
    var password = req.query.password ? req.query.password : undefined;
    // double checking, this should be done on client-side as well through required field
    if (!email || !password){
        res.status(403).json({
            success: "false",
            error: "missing field"
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
                        req.session.user = user;
                        var response = {success: 'true', user: user};
                        res.send(response);
                    }
                });
            }
        });
    }
});

router.post('/forgotpassword', function(req, res, next){
    var email = req.query.email;    
    if (!email){
        res.status(403).json({
            success: "false",
            error: "missing email"
        });
    } else {
        userExists(email).then(function(exists){
            if (!exists) {
                var response = {success: 'false', error: 'user does not exist'};
                res.status(403);
                res.send(response);
            } else {
                var token = tokenAPI.createToken(exists['id']);
                //TODO implement send email
                // var link = "localhost:8080" + "/resetpassword?email=" + email + "&token=" + token;
                // send this links
                var response = {success: 'true', email: email};
                res.send(response);
            }
        });
    }
});

router.post('/resetpassword', function(req, res, next){
    var email = req.query.email;
    var token = req.query.token;
    var newpassword = req.query.newpassword;
    userExists(email).then(function(exists){
        if (!exists) {
            var response = {success: 'false', error: 'user does not exist'};
            res.status(403);
            res.send(response);
        } else {
            tokenValid = tokenAPI.validateToken(exists['id'], token);
            console.log(tokenValid);
            if (tokenValid == true) {
                tokenAPI.destroyToken(token);
                bcrypt.hash(newpassword, saltRounds).then(function(hash) {
                    var users_customers = "users_customers";
                    var data = [
                        {password: hash},
                        {id: exists['id']}];
                    db.updateQuery(users_customers, data).then(function(updated){
                        var response = {success: 'true'};
                        res.send(response);
                    });                
                });
            } else if (tokenValid == 'expired'){
                var response = {success: 'false', error: 'expired token'};
                res.send(response);
            } else {
                var response = {success: 'false'};
                res.status(403);
                res.send(response);
            }
        }
    });
});

router.post('/signout', function(req, res, next){
    var userid = req.query.userid;
    req.session.destroy();
    var response = {success: 'true'};
    res.send(response);
});

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