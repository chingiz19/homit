var Page = require("../Page");

/* private variables */
var liquorStationUrl = "/catalog/liquor-station/beer";
var snackVendorUrl = "/catalog/snack-vendor/beverage";


class CatalogPage extends Page {
    constructor(){
        super('/catalog', "Homit");
    }

    liquorStationUrl(){
        return this.baseUrl() + liquorStationUrl;
    }

    snackVendorUrl(){
        return this.baseUrl() + snackVendorUrl;
    }
}

module.exports = CatalogPage;