app.controller("myaccountController", ["$scope", "$http", "$cookies", "$rootScope", 
function($scope, $http, $cookies, $rootScope){
    
    /* Info Section */
    $scope.user = JSON.parse( $cookies.get("user").replace("j:", ""));  
    
    $scope.updateUserInfo = function(){
            $http({
                method: 'POST',
                url: '/api/myaccount/updateUserInfo',
                data: $scope.user
            }).then(function successCallback(response) {
                if (response.data["success"]) {
                    $rootScope.$broadcast("addNotification", { 
                        type: "alert-success", 
                        message: response.data["ui_message"]
                    });
                    $scope.user = response.data.user;
                } else {
                    $rootScope.$broadcast("addNotification", { 
                        type: "alert-danger", 
                        message: response.data["ui_message"]
                    });
                }
            }, function errorCallback(response) {
                var m = response.data["ui_message"] || "Something went wrong while updating your info, please try again";
                $rootScope.$broadcast("addNotification", { type: "alert-danger", message: m});
                console.log("ERROR in password reset");
            });
    }


    /* Password section */
    $scope.showError = false;
    $scope.passwordMatch = false;

    // variables
    var errorClass = "genericError";
    
    $scope.enablePasswordChanges = function(){
        if ($scope.passwordSectionForm.$pristine){
            return false;
        }

        if (!$scope.showError && $scope.passwordSectionForm.$valid){
            return true;
        }

        return false;
    } 

    $scope.passwordMatched = function(){

        if (!$scope.confirmPassword){
            $scope.showError = false;
            return;
        }
        
        if ($scope.newPassword != $scope.confirmPassword){
            $scope.showError = true;
        } else {
            $scope.showError = false;
        }
    }

    $scope.signout = function(){
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
}]);