var router = require("express").Router();

router.get('/snacks', function(req, res, next){
    req.options.ejs["tabId"] = "othersTab";
    res.render("catalog.ejs", req.options.ejs);
})


router.get('/liquor/:category', function(req, res, next){

    var category = req.params.category;
    req.options.ejs["title"] = "Catalog";

    switch(category.toLowerCase()){
        case "beers": 
            req.options.ejs["tabId"] = "beersTab";
            break;
        case "wines": 
            req.options.ejs["tabId"] = "winesTab";
            break;
        case "spirits": 
            req.options.ejs["tabId"] = "spiritsTab";
            break;
        default: next();
    }
	res.render("catalog.ejs", req.options.ejs);
});

module.exports = router;