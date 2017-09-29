var router = require("express").Router();

const categories = {
    "liquor": ['beer', 'wine', "spirit"],
    "snacks": ['all']
}

router.get('/snacks/:category', function(req, res, next){
    res.redirect("/catalog/snacks");
})

router.get('/snacks', function(req, res, next){
    req.options.ejs["categories"] = convertArrayToString(categories.snacks);
    res.render("catalog.ejs", req.options.ejs);
})

router.get('/liquor', function(req, res, next){
    res.redirect('/catalog/liquor/beer');
})

router.get('/liquor/:category', function(req, res, next){
    req.options.ejs["categories"] = convertArrayToString(categories.liquor);
    req.options.ejs["title"] = "Catalog";
	res.render("catalog.ejs", req.options.ejs);
});



function convertArrayToString(array){
    return "[\"" + array.join("\",\"") + "\"]";
}

module.exports = router;