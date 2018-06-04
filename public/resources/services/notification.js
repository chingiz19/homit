/**
 * This service provides notification API to add various notifications to the page
 * 
 * 
 * @copyright Homit
 * @author Jeyhun Gurbanov
 */
app.service('notification', function($rootScope){
    var pub = {};

    pub.EventType = {
        ADD_CART_ITEM: 0,
        SUCCESS_MESSAGE: 1,
        ERROR_MESSAGE: 2,
        WARNING_MESSAGE: 3,
        STORE_CLOSED: 4
    };

    /**
     * Shows notification for added cart item/product
     * @param {Object} product 
     */
    pub.addCartItem = function(product){
        $rootScope.$broadcast("addNotification", {
            event_type: pub.EventType.ADD_CART_ITEM,
            product: product
        });
    };

    /**
     * Shows notification for success message
     * @param {*} message 
     */
    pub.addSuccessMessage = function(message){
        $rootScope.$broadcast("addNotification", {
            event_type: pub.EventType.SUCCESS_MESSAGE,
            message: message
        });
    };

    /**
     * Shows notification for error message
     * @param {*} message 
     */
    pub.addErrorMessage = function(message){
        $rootScope.$broadcast("addNotification", {
            event_type: pub.EventType.ERROR_MESSAGE,
            message: message
        });
    };

    /**
     * Shows notification for error message
     * @param {*} message 
     */
    pub.addWarningMessage = function(message){
        $rootScope.$broadcast("addNotification", {
            event_type: pub.EventType.WARNING_MESSAGE,
            message: message
        });
    };

    /**
     * Shows notification for error message
     * @param {*} message 
     */
    pub.addStoreClosedMessage = function(message){
        $rootScope.$broadcast("addNotification", {
            event_type: pub.EventType.STORE_CLOSED,
            message: message
        });
    };

    return pub;
});
