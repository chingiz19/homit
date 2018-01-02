app.controller("notificationController", function ($scope, $sce, notification, $timeout) {

    $scope.init = function(){
        $scope.clearAll();
        $scope.defaultTimeout = 2000; // 2 seconds
    }

    $scope.clearAll = function () {
        $scope.product = undefined;
        $scope.message = undefined;
        $scope.messageType = "";
    }

    $scope.$on("addNotification", function (event, args) {
        switch(args.event_type){
            case notification.EventType.ADD_CART_ITEM:
                addCartItem(args.product);
                break;
            case notification.EventType.SUCCESS_MESSAGE:
                addSuccessMessage(args.message);
                break;
            case notification.EventType.ERROR_MESSAGE:
                addErrorMessage(args.message);
                break;
            default:
                console.warn("Notification event type not supported");
        }
    })


    /* Private helper methods */

    function addCartItem(product){
        $scope.product = product;

        clearWithTimeout();
    }   

    function addSuccessMessage(message){
        $scope.message = message;
        $scope.messageType = "success_msg"; // success message class name
        clearWithTimeout();
    }

    function addErrorMessage(message){
        $scope.message = message;
        $scope.messageType = "error_msg"; // success message class name
        clearWithTimeout($scope.defaultTimeout * 2); // sticky message, wait twice longer before removing from UI
    }

    /**
     * Clear notifications after 'n' milliseconds
     * @param {*} timeout 
     */
    function clearWithTimeout(timeout){
        var time = timeout;
        if (!time){
            time = $scope.defaultTimeout;
        }

        $timeout(function(){
            $scope.clearAll();
        }, time);
    }

    $scope.init();
});