var router = require("express").Router();

const categories = {
    "liquor": ['beer', 'wine', "spirit"],
    "snackvendor": ['all']
}

router.get('/:parent/', function(req, res, next){
    res.redirect("/catalog/" + req.params.parent + "/" + categories[req.params.parent][0]);
})

router.get('/:parent/:category', function(req, res, next){
    req.options.ejs["categories"] = convertArrayToString(categories[req.params.parent]);
    	res.render("catalog.ejs", req.options.ejs);
})

function convertArrayToString(array){
    return "[\"" + array.join("\",\"") + "\"]";
}

module.exports = router;