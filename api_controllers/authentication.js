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
            error: {
                "code": "U000",
                "dev_message": "Missing params",
                "required_params": ["email"]
            }
        });
    } else {
        userExists(email).then(function(exists){
            if (!exists) {
                res.json({
                    status: "success",
                    exists: false
                });
            } else {
                res.json({
                    status: "success",
                    exists: true
                });
            }
        });
    }
});


router.post('/signup', function(req, res, next) {
    // var fname = req.body.fname; // might use this tecnhique later
    var fname = req.body.fname;
    var lname = req.body.lname;
    var email = req.body.email;
    var dob = req.body.dob;
    var password = req.body.password;
    var phone = req.body.phone;

    if (!(fname && lname && email && dob && password && phone)) {
        res.status(400).json({
            "error": {
                "code": "U000",
                "dev_message": "Missing params"
            }
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
                        req.cookies.user = user;

                        console.log("Cookies: "+ req.cookies);

                        res.json({
                            status: "success",
                            ui_message: "Successfully signed up. You will receive an email with confirmation"
                        });
                    });
                } else {
                    res.json({
                        error: {
                            code: "A002",
                            "ui_message": "User already exists"
                        }
                    });
                }
            });
        });
    }
});

router.get('/signin', function(req, res, next) {
    var email = req.query.email ? req.query.email : undefined;
    var password = req.query.password ? req.query.password : undefined;
    // double checking, this should be done on client-side as well through required field
    if (!email || !password){
        res.status(403).json({
            "error": {
                "code": "U000",
                "dev_message": "Missing params"
            }
        });
    } else {
        userExists(email).then(function(user){
            var errResponse = {
                error: {
                    code: "A003",
                    ui_message: "Invalid email, or password"
                }
            }; 
            if (!user) {
                res.json(errResponse);
            } else {
                bcrypt.compare(password, user['password']).then(function(match) {
                    if (!match) {
                        res.json(errResponse);
                    } else {
                        delete user["password"];
                        //TODO
                        req.session.user = user;
                        res.cookie('user', user);

                        res.json({
                            status: "success",
                            ui_message: "Successfully signed in"
                        });
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
            "error": {
                "code": "U000",
                "dev_message": "Missing params"
            }
        });
    } else {
        userExists(email).then(function(exists){
            if (!exists) {
                res.json({
                    error: {
                        code: "A001",
                        ui_message: "User doesn't exist"
                    }
                });
            } else {
                var token = tokenAPI.createToken(exists['id']);
                //TODO implement send email
                // var link = "localhost:8080" + "/resetpassword?email=" + email + "&token=" + token;
                // send this links
                res.json({
                    status: "success",
                    ui_message: "Email with reset instructions has been sent"
                });
            }
        });
    }
});

router.post('/resetpassword', function(req, res, next){
    var token = req.query.token;
    var oldpassword = req.query.oldpassword;
    var newpassword = req.query.newpassword;

    if (!token){

    } else {
        
    }
    // userExists(email).then(function(exists){
    //     if (!exists) {
    //         var response = {success: 'false', error: 'user does not exist'};
    //         res.status(403);
    //         res.send(response);
    //     } else {
    //         tokenValid = tokenAPI.validateToken(exists['id'], token);
    //         console.log(tokenValid);
    //         if (tokenValid == true) {
    //             tokenAPI.destroyToken(token);
    //             bcrypt.hash(newpassword, saltRounds).then(function(hash) {
    //                 var users_customers = "users_customers";
    //                 var data = [
    //                     {password: hash},
    //                     {id: exists['id']}];
    //                 db.updateQuery(users_customers, data).then(function(updated){
    //                     var response = {success: 'true'};
    //                     res.send(response);
    //                 });                
    //             });
    //         } else if (tokenValid == 'expired'){
    //             var response = {success: 'false', error: 'expired token'};
    //             res.send(response);
    //         } else {
    //             var response = {success: 'false'};
    //             res.status(403);
    //             res.send(response);
    //         }
    //     }
    // });
});

router.post('/signout', function(req, res, next){
    req.session.destroy(function(err){
        if (err){
            res.status(400).send({});
        } else {
            res.status(200).send({"success": true});
        }
    });
});

var userExists = function(email) {
    var users_customers = "users_customers";
    var data = {user_email: email};
    return db.selectQuery(users_customers, data).then(function(dbResult) {
        if (dbResult.length>0) {
            return dbResult[0];
        } else {
            return db.selectQuery('esl_users', data).then(function(results){
                if (results.length > 0) 
                    return results[0];
                else 
                    return false;
            });
        }
    });
};



module.exports = router;