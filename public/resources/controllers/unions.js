app.controller("unionsPageController", function ($scope, $location, $http, $window, helpers, $timeout, sessionStorage, googleAnalytics, localStorage, notification, user) {

    $scope.init = function () {
        $scope.storeName = $location.path().split("/")[2];
        console.log("test here!");
        $http({
            method: 'GET',
            url: "/api/hub/" + $scope.storeName
        }).then(function successCallback(response) {
            if (response.data.success) {
                console.log(response.data.stores);
            } else {
                notification.addErrorMessage("Ups.. Error loading stores");
            }
        }, function errorCallback(response) {
            notification.addErrorMessage("Ups.. Error loading stores");
        });
    };

    /**
     * Redirects to store page
     * @param {string} product 
     */
    $scope.hrefPrdPage = function (product) {
        let tmpPrdouct = product;
        tmpPrdouct["store_type_name"] = $scope.storePage.store_info.name;
        googleAnalytics.addEvent('product_clicked', {
            "event_label": tmpPrdouct.brand + " " + tmpPrdouct.name,
            "event_category": googleAnalytics.eventCategories.store_page_actions
        });
        $window.location.href = $window.location.origin + helpers.buildProductPagePath(tmpPrdouct);
    };

    $window.onload = function () {
    };

    $scope.init();
});