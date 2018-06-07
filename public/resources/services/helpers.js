/**
 * This service is for helper functions that are commonly used in many placesd
 * 
 * 
 * @copyright Homit
 * @author Jeyhun Gurbanov
 */
app.service('helpers', function(){
    var pub = {};

    pub.randomDigitGenerator = function(){
        return Math.floor(Math.random()*90000000) + 10000000;
    }

    pub.buildProductPagePath = function(product){
        var path;
        return path = "/catalog/product/" + product.store_type_api_name + "/" + _.toLower(pub.clearProductUrl(_.trim(_.toLower(_.trim(product.brand) + " " + _.trim(product.name))).replace(/ /g, "-"))) + "/" + product.product_id;
    }

    pub.clearProductUrl = function(path) {
        var tempPath = path;
        tempPath = tempPath.replace(/[#&',.%/()]/g, "");
        tempPath = tempPath.replace(/---/g, "-");
        tempPath = tempPath.replace(/--/g, "-");
        return tempPath;
    }

    pub.urlReplaceSpaceWithDash = function(string){
        return string.toLowerCase().replace(/ /g, "-");
    }

    return pub;
});
