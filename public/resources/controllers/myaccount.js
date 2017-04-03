app.controller("myaccountController", ["$scope", "$http", function($scope, $http){
    
    /* Info Section */
    //TODO: init with http call when page is loaded
    $scope.firstname = "Badass";
    $scope.lastname = "Team";

    //variables
    var initialFirstName = "Badass";
    var initialLastName = "Team";

    $scope.registerChanges = function(){
        // enable change request is any of the boxes has new values
        if ($scope.firstname == initialFirstName && $scope.lastname == initialLastName){
            return true;    
        }
        return false;
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

    $scope.singout = function(){
        $http.post({
            url: "/api/singout"
        }).then(function(success){
            
        });
    }
}]);