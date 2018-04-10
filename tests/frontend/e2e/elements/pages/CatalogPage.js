var Page = require("../Page");

/* private variables */
var liquorStationUrl = "/catalog/liquor-station/beer";
var snackVendorUrl = "/catalog/snack-vendor/beverage";
var linasStoreUrl = "/catalog/linas-italian-store/condiments";


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

    linasStoreUrl(){
        return this.baseUrl() + linasStoreUrl;
    }
}

module.exports = CatalogPage;