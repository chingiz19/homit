var router = require("express").Router();
var db = require("../db.js");
var tokenAPI = require("../token.js");
var bcrypt = require('bcrypt');
const saltRounds = 10;

// router.use(global.checkAuth);

router.post('/resetpassword', function(req, res, next){
    var email = req.query.email;
    var token = req.query.token;
    var newpassword = req.query.newpassword;
    userExists(email).then(function(exists){
        if (!exists) {
            res.json({
                error: {
                    code: "M001",
                    ui_message: "User doesn't exist"
                }
            });
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
                        var response = {status: 'success'};
                        res.send(response);
                    });                
                });
            } else if (tokenValid == 'expired'){
                res.json({
                    error: {
                        code: "M002",
                        ui_message: "Expired token."
                    }
                });
            } else {
                var response = {
                    code: "M003",
                    ui_message: ""
                };
                res.status(403);
                res.send(response);
            }
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
            return false;
        }
    });
};



module.exports = router;