var router = require("express").Router();

router.get('/getorder', function(req, res, next){
    //check logged in user in esl_database
    if (!req.session.user) next();

    var checkQuery = "SELECT first_name, last_name FROM esl_users WHERE ?";

    db.runQuery(checkQuery, {user_email: req.session.user.user_email}).then(function(data){
        if (data.length <= 0 && data[0].first_name != req.session.user.first_name && data[0].first_name != req.session.user.first_name) next();        
        //get query to collect everything in orders_db
        db,selectQuery("orders", ["id"]).then(function(data){
            //send
            if (!data) 
                res.send({});
            else
                res.send(data);
        });
    });
});

router.get('/neworder', function(req, res, next){

});

module.exports = router;