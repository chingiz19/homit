var router = require("express").Router();
var _ = require("lodash");

const categories = {
    "liquor-station": ['beer', 'liqueur', 'spirit', 'wine'],
    "snack-vendor": ['beverage', 'everyday-needs', 'party-supply', 'snack']
}

router.get("/product/:productId", function(req, res, next){
    res.render("product.ejs", req.options.ejs);
});

router.get('/:parent/', function(req, res, next){
    try{
        res.redirect("/catalog/" + req.params.parent + "/" + categories[req.params.parent][0]);
    } catch(e){
        next()
    }
});

router.get('/:parent/:category', function(req, res, next){
    if (!_.includes(categories[req.params.parent], req.params.category)){
        return res.redirect("/notfound");
    }

    try{
        req.options.ejs.categories = convertArrayToString(categories[req.params.parent]);
        req.options.ejs.loadedStore = _.startCase(req.params.parent);
        req.options.ejs.selectedCategory = req.params.category;
        res.render("catalog.ejs", req.options.ejs);
    } catch(e){
        next()
    }
});

function convertArrayToString(array){
    return "[\"" + array.join("\",\"") + "\"]";
}

module.exports = router;