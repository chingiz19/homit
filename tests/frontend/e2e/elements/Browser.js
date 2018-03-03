/* Private variables */
var _baseUrl;

class Browser {
    constructor(){
        _baseUrl = "http://localhost:8080";
    }

    getBaseUrl(){
        return _baseUrl;
    }
}

module.exports = Browser;