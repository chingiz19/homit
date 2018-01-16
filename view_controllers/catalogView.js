var router = require("express").Router();

const categories = {
    "liquor": ['beer', 'wine', "spirit", "liqueur"],
    "snackvendor": ['all']
}

router.get('/:parent/', function(req, res, next){
    try{
        res.redirect("/catalog/" + req.params.parent + "/" + categories[req.params.parent][0]);
    } catch(e){
        next()
    }
})

router.get('/:parent/:category', function(req, res, next){
    try{
        req.options.ejs["categories"] = convertArrayToString(categories[req.params.parent]);
        res.render("catalog.ejs", req.options.ejs);
    } catch(e){
        next()
    }
})

function convertArrayToString(array){
    return "[\"" + array.join("\",\"") + "\"]";
}

module.exports = router;