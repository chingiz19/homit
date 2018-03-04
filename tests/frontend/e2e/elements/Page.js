var Browser = require("./Browser");

class Page extends Browser {
    constructor(url, title){
        super();
        this._url = url;
        this._title = title;
    }

    refresh(){
        browser.refresh();
    }

    close(){
        //TODO: close browser tab
    }

    load(){
        browser.get(this.getBaseUrl() + this._url);
    }
    
    title(){
        return this._title;
    }
}

module.exports = Page;