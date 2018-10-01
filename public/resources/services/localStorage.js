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

    pub.setUserCoupons = function(value){
        return pub.set("homit_userCoupons", value);
    };

    pub.getUserCoupons = function(){
        return (pub.get("homit_userCoupons") || {});
    };

    pub.setHeaderNotificationCleared = function(value){
        return pub.set("homit_HeaderNotificationCleared", value);
    };

    pub.getHeaderNotificationCleared = function(){
        return (pub.get("homit_HeaderNotificationCleared") || false );
    };

    pub.setNumberOfCouponsSeen = function(value){
        return pub.set("homit_couponNumberSeen", value);
    };

    pub.getNumberOfCouponsSeen = function(){
        return (pub.get("homit_couponNumberSeen") || 0 );
    };

    pub.setCartVersion = function(value){
        return pub.set("cart_version", value);
    };

    pub.getCartVersion = function(){
        return pub.get("cart_version");
    };

    pub.setSchedulerVersion = function(value){
        return pub.set("scheduler_version", value);
    };

    pub.getSchedulerVersion = function(){
        return pub.get("scheduler_version");
    };

    pub.setOrderDeliveryHrs = function(value){
        return pub.set("order_delivery_hrs", value);
    };

    pub.getOrderDeliveryHrs = function(){
        return pub.get("order_delivery_hrs");
    };

    pub.clearAfterCheckout = function(){
        return pub.setOrderDeliveryHrs({}) && pub.setUserCart({}) && pub.setUserCoupons({}) && pub.setNumberOfCouponsSeen(0);
    };

    pub.clearUserPushNotifications = function(){
        return pub.setNumberOfCouponsSeen(0) && pub.setHeaderNotificationCleared(false);
    };

    return pub;
}]);
