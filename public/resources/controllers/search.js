app.controller("searchController", function ($location, $scope, $cookies, $window, $http, $rootScope, $timeout, $mdSidenav, $log, sessionStorage, notification, googleAnalytics, localStorage, helpers) {

    $scope.init = function(){

        $scope.searchResult = {};

    }

    $window.onload = function () {
        $http({
            method: 'POST',
            url: "/api/hub/search",
            data: {
                "search": $scope.searchText
            }
        }).then(function successCallback(response) {
            if(response.data.success){
                $scope.resultProducts = response.data.result.products;
                $scope.resultStores = response.data.result.store_type;
            }else{
                notification.addErrorMessage("Ups.. Error getting search query");    
            }
        }, function errorCallback(response) {
            notification.addErrorMessage("Ups.. Error getting search query");
        });
    };

    $scope.init();

});

