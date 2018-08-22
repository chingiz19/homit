app.controller("searchController", function ($location, $scope, $cookies, $window, $http, $rootScope, $timeout, $log, sessionStorage, notification, googleAnalytics, localStorage, helpers) {

    $scope.init = function(){

        $scope.searchResult = {};
        $scope.resultLength = 0;

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
                $scope.resultStores = response.data.result.store_type;
                $scope.resultProducts = response.data.result.products;
                for(let key in $scope.resultProducts){
                    for(let i=0; i<$scope.resultProducts[key].length; i++){
                        let product = $scope.resultProducts[key][i]._source;

                        product["_id"] = $scope.resultProducts[key][i]["_id"];
                        product["product_url"] = helpers.buildProductPagePath(product, "linas-italian-market");
                        if(product.details.preview.description){
                            product.details.preview["description_tagged"] = helpers.clearHomitTags(product.details.preview.description);
                        }
                        $scope.resultProducts[key][i]._source = product;
                    }
                    $scope.resultLength = $scope.resultLength + $scope.resultProducts[key].length;
                }
                $scope.resultLength = $scope.resultLength + $scope.resultStores.length;
            }else{
                notification.addErrorMessage("Ups.. Error getting search query");    
            }
        }, function errorCallback(response) {
            notification.addErrorMessage("Ups.. Error getting search query");
        });
    };

    $scope.init();

});

