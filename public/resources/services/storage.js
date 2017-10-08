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

    return {
        get: _get,
        set: _set
    }
}]);
