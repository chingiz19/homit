 app.controller("resetPasswordController", function($scope, $http, $location, $window) {

    $scope.init = function(){
        $scope.new_password = "";
        $scope.confirm_password = "";        
        
        var path = $location.path().split("/");
        $scope.user_email = path[2];
        $scope.token = path[3];
    }

    $scope.resetPassword = function(){
        $http({
            method: "POST",
            url: "/api/authentication/resetpassword",
            data: {
                email: $scope.user_email,
                token: $scope.token,
                new_password: $scope.new_password,
                confirm_password: $scope.confirm_password,
            }
        }).then(function successCallback(response) {
            if (response.data.success) {
                $window.location.href= "/main";
            } else {
                alert(response.data.ui_message);
                console.log("password not reset. Try again");
            }
        }, function errorCallback(response) {
            console.log("ERROR in password reset");
        });
    }

    $scope.init();
});