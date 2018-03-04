var Page = require("../Page");

class MainPage extends Page {
    constructor(){
        super('/main', "Homit | Snack, Liquor and Party Supply Delivery in Calgary");

        this.addressAutocompleteInput = element(by.id("autocompleteAddressInputBox")); 
        this.addressMessage = element(by.binding('addressMessage'));
        this.goToHomitHubArrowBtn = element(by.id('goToHomitHubArrowBtn'));
        this.snackVendorDiv = element(by.id('snack-vendor'));
        this.liquorStationDiv = element(by.id('liquor-station'));
    }

    get(){
        browser.get(this.baseUrl() + "/main");
        return this;
    }

    setAddress(addr){
        this.addressAutocompleteInput.sendKeys(addr);
        return this;
    }

    selectFirstAddress(){
        this.addressAutocompleteInput
            .sendKeys(protractor.Key.ARROW_DOWN)
            .sendKeys(protractor.Key.ENTER);
        return this;
    }

    getAddressMessageText(){
        return this.addressMessage.getText();
    }

    clickSnackVendorDiv(){
        this.snackVendorDiv.click();
    }

    clickLiquorStationDiv(){
        this.liquorStationDiv.click();
    }

    getErrorAddressMessage(){
        return "Sorry, we do not deliver to your location at the moment.";
    }

    homitHubUrl(){
        return this.baseUrl() + "/main#homithub";
    }
}

module.exports = MainPage;