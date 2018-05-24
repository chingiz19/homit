app.service('localStorage', ["$window", function($window){
    var _store = $window.localStorage;
    var pub = {};
    pub.set = function(key, value){
        if (!_store) return false;
        if(typeof(value) == 'object') value = JSON.stringify(value);
        _store.setItem(key, value);
        return true;
    };

    pub.get = function(key){
        if (!_store) return false;
        var value = _store.getItem(key);
        if (value && value.startsWith("{")) value = JSON.parse(value);
        return value;
    };

    pub.setUserCart = function(value){
        return pub.set("homit_userCart", value);
    };

    pub.getUserCart = function(){
        return pub.get("homit_userCart");
    };

    pub.setCartVersion = function(value){
        return pub.set("cart_version", value);
    };

    pub.getCartVersion = function(){
        return pub.get("cart_version");
    };

    pub.setOrderDeliveryHrs = function(value){
        return pub.set("order_delivery_hrs", value);
    };

    pub.getOrderDeliveryHrs = function(){
        return pub.get("order_delivery_hrs");
    };

    pub.clearAfterCheckout = function(){
        return pub.setOrderDeliveryHrs({}) && pub.setUserCart({});
    };

    return pub;
}]);
