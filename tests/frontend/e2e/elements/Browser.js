class Browser {
    constructor(){
        this._baseUrl = "http://localhost:8080";
    }

    baseUrl(){
        return this._baseUrl;
    }

    currentUrl(){
        return browser.getCurrentUrl();
    }
}

module.exports = Browser;