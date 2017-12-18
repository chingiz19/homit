/**
 * This service provides sessionStorage services
 * 
 * 
 * @copyright Homit (c) 2017
 * @author Jeyhun Gurbanov
 */
app.service('sessionStorage', ["$window", function($window){
    var _store = $window.sessionStorage;

    var _set = function(key, value){
        if (!_store) return false;
        if(typeof(value) == 'object') value = JSON.stringify(value);
        _store.setItem(key, value);
        return true;
    }

    var _get = function(key){
        if (!_store) return false;
        var value = _store.getItem(key);
        if (value == "undefined") return undefined;
        if (value && (value.startsWith("{") || value.startsWith("["))) value = JSON.parse(value);
        return value;
    }

    var _getSearchSubcategory = function(){
        var value = _get("searchSubcategory");
        _setSearchSubcategory(undefined);
        return value;
    }

    var _getSearchProduct = function(){
        var value = _get("searchProduct");
        _setSearchProduct(undefined);
        return value;
    }

    var _getCheckoutUserInfo = function(){
        var value = _get("setCheckoutUserInfo");
        _setCheckoutUserInfo(undefined);
        return value;
    }

    var _setSearchSubcategory = function(value){
        return _set("searchSubcategory", value);
    }

    var _setSearchProduct = function(value){
        return _set("searchProduct", value);
    }

    var _setCheckoutUserInfo = function(value){
        return _set("setCheckoutUserInfo", value);
    }

    var _setAddress = function(value){
        return _set("delivery-address", value);
    }

    var _getAddress = function(value){
        return _get("delivery-address");
    }

    return {
        get: _get,
        set: _set,
        getSearchSubcategory: _getSearchSubcategory,
        getSearchProduct: _getSearchProduct,
        getCheckoutUserInfo: _getCheckoutUserInfo,
        setSearchSubcategory: _setSearchSubcategory,
        setSearchProduct: _setSearchProduct,
        setCheckoutUserInfo: _setCheckoutUserInfo,
        setAddress: _setAddress,
        getAddress: _getAddress
    }
}]);
