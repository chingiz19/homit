app.service('advancedStorage', ["$window", function($window){
    var _store = $window.localStorage;

    var _set = function(key, value){
        if (!_store) return false;
        if(typeof(value) == 'object') value = JSON.stringify(value);
        _store.setItem(key, value);
        return true;
    }

    var _get = function(key){
        if (!_store) return false;
        var value = _store.getItem(key);
        if (value && value.startsWith("{")) value = JSON.parse(value);
        return value;
    }

    var _setUserCart = function(value){
        return _set("homit_userCart", value);
    }

    var _getUserCart = function(){
        return _get("homit_userCart");
    }

    return {
        get: _get,
        set: _set,
        setUserCart: _setUserCart,
        getUserCart: _getUserCart
    }
}]);
