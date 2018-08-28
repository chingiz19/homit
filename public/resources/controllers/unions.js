app.controller("unionsPageController", function ($scope, $location, $http, $window, helpers, $timeout, sessionStorage, googleAnalytics, localStorage, notification, user) {

    $scope.init = function () {
        $scope.unionStores = [];
        $scope.storeName = $location.path().split("/")[2];
        $http({
            method: 'GET',
            url: "/api/hub/" + $scope.storeName
        }).then(function successCallback(response) {
            if (response.data.success) {
                $scope.unionStores = response.data.stores;
            } else {
                notification.addErrorMessage("Ups.. Error loading stores");
            }
        }, function errorCallback(response) {
            notification.addErrorMessage("Ups.. Error loading stores");
        });
    };

    $window.onload = function () {
    };

    $scope.init();
});