var Browser = require("./Browser");

/* private variables */
var _title;
var _url;

class Page extends Browser {
    constructor(url, title){
        super();
        _url = url;
        _title = title;
    }

    refresh(){
        browser.refresh();
    }

    close(){
        //TODO: close browser tab
    }

    load(){
        browser.get(this.getBaseUrl() + _url);
    }
    
    title(){
        return _title;
    }
}

module.exports = Page;