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
            if (!args.reload){
                notification.show = false;
                $(".close").click();
            } else {
                if (args.href)
                    window.location.href = args.href;
                else
                    window.location.reload();
            }
        }, 1200);
    })

    notification.reset();
});