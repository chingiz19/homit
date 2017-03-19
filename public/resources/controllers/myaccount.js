app.controller("myaccountController", ["$scope", function($scope){
    $scope.newPassword = "";
    $scope.confirmPassword = "";
    $scope.showError = false;
    $scope.matchPassword = function(){
        var nPass = $("#nPassword");
        var cPass = $("#cPassword");
        var errorClass = "genericError";
        // check that none is edited
        if (nPass.hasClass("ng-dirty") && cPass.hasClass("ng-dirty")){
            // add error-class if values do not match
            if ($scope.newPassword != $scope.confirmPassword){
                cPass.addClass(errorClass);
                $scope.showError = true;
            } else {
                cPass.removeClass(errorClass);
                $scope.showError = false;
            }
        } else {
            cPass.removeClass(errorClass);
            $scope.showError = false;
        }
    }
}]);