var Page = require("../Page");

/* private variables */
var addressAutocompleteInput = element(by.id("autocompleteAddressInputBox")); 
var addressMessage = element(by.binding('addressMessage'));
var url_base = "http://localhost:8080";


class MainPage extends Page {
    constructor(){
        super('/main', "Homit | Snack, Liquor and Party Supply Delivery in Calgary");
    }

    get(){
        browser.get(url_base + "/main");
        return this;
    }

    getTitle(){
        return this.title();
    }

    setAddress(addr){
        addressAutocompleteInput.sendKeys(addr);
        return this;
    }

    selectFirstAddress(){
        addressAutocompleteInput
            .sendKeys(protractor.Key.ARROW_DOWN)
            .sendKeys(protractor.Key.ENTER);
        return this;
    }

    getAddressMessageText(){
        return addressMessage.getText();
    }

    getErrorAddressMessage(){
        return "Sorry, we do not deliver to your location at the moment.";
    }
}

module.exports = new MainPage();