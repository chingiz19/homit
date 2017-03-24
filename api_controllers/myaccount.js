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