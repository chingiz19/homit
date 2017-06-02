var router = require("express").Router();
var db = require("../db.js");

router.get('/usercart', function(req, res, next){
    var user_id = req.query.user_id;
    getUserCart(user_id).then(function(cart) {
        res.send(cart);
    });

});

router.post('/addproduct', function(req, res, next){
    var response = {
        success: true
    };
    res.send(response);
});

router.post('/removeproduct', function(req, res, next){
    var response = {
        success: true
    };
    res.send(response);
});

router.post('/clear', function(req, res, next){
    var response = {
        success: true
    };
    res.send(response);
});


/**
 * Return user's cart based on the user id provided
 */
var getUserCart = function(user_id) {
    var sqlQuery = `SELECT s.category_id = u.id AND ?`;
    var data = {"u.id": user_id};
    return db.runQuery(sqlQuery, data).then(function(dbResult) {
        return dbResult;
    });
};


module.exports = router;