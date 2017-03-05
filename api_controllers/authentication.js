var router = require("express").Router();
var db = require("../db.js");

router.post('/signup', function(req, res, next){
    var fname = req.query.fname;
    var lname = req.query.lname;
    var email = req.query.email;
    var dob = req.query.dob;
    var password = req.query.password;
    var phone = req.query.phone;
    var data = { fname: fname, lname: lname };
    db.insertQuery("test", data).then(function(dbResult){
        var response = {success: 'true', userid: dbResult.insertId};
	    res.send(response);
    });
});

// router.get('/signin', function(req, res, next){
//     res.send("in the get wines");
// });

// router.get('/reset', function(req, res, next){
//     res.send("in the get wines");
// });

module.exports = router;