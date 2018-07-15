var Page = require("../Page");

/* private variables */
var liquorStationUrl = "/hub/liquor-station/beer";
var snackVendorUrl = "/hub/snack-vendor/beverage";
var linasStoreUrl = "/hub/linas-italian-store/condiments";


class CatalogPage extends Page {
    constructor(){
        super('/hub', "Homit");
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