app.controller("myaccountController", function($scope, $http) {
    $scope.sidebarOption = function(section){
        $("#" + section).removeClass("hidden");
    }
});