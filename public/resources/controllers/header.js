app.controller("LogoSearchController", function ($scope, $http) {

});

app.controller("NavigationController", function ($scope, $http, $cookies, $window, $rootScope) {
        $scope.logout = function(){
            $http({
                method: 'POST',
                url: '/api/authentication/signout'
            }).then(function successCallback(response) {
                if (response.data["success"]) {
                    //delete cookie
                    $cookies.remove("user");
                    $rootScope.$broadcast("addNotification", { 
                        type: "alert-success", 
                        message: response.data["ui_message"], 
                        href: "/", 
                        reload: true 
                    });
                } else {
                    // TODO: error handling
                    console.log("password not reset");
                }
            }, function errorCallback(response) {
                $rootScope.$broadcast("addNotification", { type: "alert-danger", message: response.data["ui_message"]});
                console.log("ERROR in password reset");
            });
    }
});