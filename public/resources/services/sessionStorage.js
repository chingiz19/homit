/**
 * This service provides sessionStorage services
 * 
 * 
 * @copyright Homit (c) 2017
 * @author Jeyhun Gurbanov
 */
app.service('sessionStorage', ["$window", function($window){
    //TODO: rewrite with pub object
    var _store = $window.sessionStorage;

    var _set = function(key, value){
        if (!_store) return false;
        if(typeof(value) == 'object') value = JSON.stringify(value);
        _store.setItem(key, value);
        return true;
    };

    var _get = function(key){
        if (!_store) return false;
        var value = _store.getItem(key);
        if (value == "undefined") return undefined;
        if (value && (value.startsWith("{") || value.startsWith("["))) value = JSON.parse(value);
        return value;
    };

    var _getSearchSubcategory = function(){
        var value = _get("searchSubcategory");
        _setSearchSubcategory(undefined);
        return value;
    };

    var _getCheckoutUserInfo = function(){
        var value = _get("setCheckoutUserInfo");
        _setCheckoutUserInfo(undefined);
        return value;
    };

    var _setSearchSubcategory = function(value){
        return _set("searchSubcategory", value);
    };

    var _setCheckoutUserInfo = function(value){
        return _set("setCheckoutUserInfo", value);
    };

    var _setAddress = function(value){
        return _set("delivery-address", value);
    };

    var _getAddress = function(value){
        return _get("delivery-address");
    };

    var _setAddressLat = function(value){
        return _set("delivery-address-latitude", value);
    };

    var _getAddressLat = function(value){
        return _get("delivery-address-latitude");
    };

    var _setAddressLng = function(value){
        return _set("delivery-address-longitude", value);
    };

    var _getAddressLng = function(value){
        return _get("delivery-address-longitude");
    };
    
    var _setCoverageMap = function(value){
        return _set("coverage-map", value);
    };

    var _getCoverageMap = function(value){
        return _get("coverage-map");
    };

    var _setAddressUnitNumber = function(value){
        return _set("address-unit-number", value);
    };

    var _getAddressUnitNumber = function(){
        return _get("address-unit-number");
    };

    var _setAccountSection = function(value){
        return _set("account-section", value);
    };

    var _getAccountSection = function(){
        return _get("account-section");
    };

    var _clearAfterCheckout = function(){
        _setAddressUnitNumber("");
        _setCheckoutUserInfo("");
    };

    var _setUserSelectedSubcategory = function(value){
        return _set("user-selected-subcategory", value);
    };

    var _getUserSelectedSubcategory = function(){
        return _get("user-selected-subcategory");
    };

    return {
        get: _get,
        set: _set,
        getSearchSubcategory: _getSearchSubcategory,
        getCheckoutUserInfo: _getCheckoutUserInfo,
        setSearchSubcategory: _setSearchSubcategory,
        setCheckoutUserInfo: _setCheckoutUserInfo,
        setAddress: _setAddress,
        getAddress: _getAddress,
        setAddressLat: _setAddressLat,
        getAddressLat: _getAddressLat,
        setAddressLng: _setAddressLng,
        getAddressLng: _getAddressLng,
        setCoverageMap: _setCoverageMap,
        getCoverageMap: _getCoverageMap,
        setAddressUnitNumber: _setAddressUnitNumber,
        getAddressUnitNumber: _getAddressUnitNumber,
        setAccountSection: _setAccountSection,
        getAccountSection: _getAccountSection,
        setUserSelectedSubcategory: _setUserSelectedSubcategory,
        getUserSelectedSubcategory: _getUserSelectedSubcategory,
        clearAfterCheckout: _clearAfterCheckout
    };
}]);