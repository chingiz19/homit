app.controller("notificationController", function ($scope, $sce, notification, $timeout, helpers) {

    $scope.init = function(){
        $scope.defaultTimeout = 2000; // 2 seconds
        $scope.notifications = [];

        $scope.types = {
            "cart_item": 0,
            "success_message": 1,
            "error_message": 2,
            "warning_message": 3,
            "store_closed": 4
        }
    };

    $scope.$on("addNotification", function (event, args) {
        switch(args.event_type){
            case notification.EventType.ADD_CART_ITEM:
                addCartItem(args.product, $scope.types["cart_item"]);
                break;
            case notification.EventType.SUCCESS_MESSAGE:
                addSuccessMessage(args.message, $scope.types["success_message"]);
                break;
            case notification.EventType.ERROR_MESSAGE:
                addErrorMessage(args.message, $scope.types["error_message"]);
                break;
            case notification.EventType.WARNING_MESSAGE:
                addWarningMessage(args.message, $scope.types["warning_message"]);
                break;
            case notification.EventType.STORE_CLOSED:
                addStoreClosedMessage(args.message, $scope.types["store_closed"]);
                break;
            default:
                console.warn("Notification event type not supported");
        }
    });


    /* Private helper methods */

    function addCartItem(product, type){
        let item = {
            id: helpers.randomDigitGenerator(),
            type: type,
            product: product
        }
        $scope.notifications.push(item);
        $scope.clearWithTimeout(item.id, 2000);
    }   

    function addSuccessMessage(message, type){
        let item = {
            id: helpers.randomDigitGenerator(),
            type: type,
            message: message
        }
        $scope.notifications.push(item);
        $scope.clearWithTimeout(item.id, 2500);
    }

    function addErrorMessage(message, type){
        let item = {
            id: helpers.randomDigitGenerator(),
            type: type,
            message: message
        }
        $scope.notifications.push(item);
        $scope.clearWithTimeout(item.id, 5000);
    }

    function addWarningMessage(message, type){
        let item = {
            id: helpers.randomDigitGenerator(),
            type: type,
            message: message
        }
        $scope.notifications.push(item);
        $scope.clearWithTimeout(item.id, 4000);
    }

    function addStoreClosedMessage(message, type){
        let item = {
            id: helpers.randomDigitGenerator(),
            type: type,
            message: message
        }
        $scope.notifications.push(item);
        $scope.clearWithTimeout(item.id, 3000);
    }

    /**
     * Clear notifications after 'n' milliseconds
     * @param {*} timeout 
     */

    $scope.clearWithTimeout = function(id, timeout){
        let time = timeout;
        let itemId = id;
        if (!time){
            time = $scope.defaultTimeout;
        }

        $scope.timeoutIsSet = $timeout(function(){
            for (let i = 0; i < $scope.notifications.length; i++){
                if ($scope.notifications[i].id == itemId){
                    $scope.notifications.splice(i, 1);
                    break;
                }
            }
        }, time);
    }

    $scope.init();
});