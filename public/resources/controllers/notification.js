app.controller("notificationController", function ($scope, $sce) {
    var notification = this;

    notification.reset = function () {
        notification.type = "";
        notification.message = "";
        notification.show = false;
    }

    $scope.$on("addNotification", function (event, args) {
        notification.type = args.type;
        notification.message = args.message;
        notification.show = true;
        setTimeout(function () {
            window.location.reload();
        }, 2500);
    })

    notification.reset();
});