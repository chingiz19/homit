/**
 * This service provides storage services
 * 
 * 
 * @copyright Homit (c) 2017
 * @author Jeyhun Gurbanov
 */
app.service('storage', ["$window", function($window){
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

    var _setSearchSubcategory = function(value){
        return _set("searchSubcategory", value);
    }

    var _setSearchProduct = function(value){
        return _set("searchProduct", value);
    }

    return {
        get: _get,
        set: _set,
        getSearchSubcategory: _getSearchSubcategory,
        getSearchProduct: _getSearchProduct,
        setSearchSubcategory: _setSearchSubcategory,
        setSearchProduct: _setSearchProduct
    }
}]);
