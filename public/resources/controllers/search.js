app.controller("searchController", function ($location, $scope, $cookies, $window, $http, $rootScope, $timeout, $log, sessionStorage, notification, googleAnalytics, localStorage, helpers) {

    $scope.init = function () {

        $scope.result_length = 0;

        $http({
            method: 'POST',
            url: "/api/hub/randomproducts",
            data: {
                limit: 6
            }
        }).then(function successCallback(response) {
            $scope.recommended_products = response.data.result;
            for (let i = 0; i < $scope.recommended_products.length; i++) {
                let recomended_product = $scope.recommended_products[i];
                recomended_product["product_url"] = helpers.buildProductPagePath(recomended_product, recomended_product.store_type_name);
                if (recomended_product.details.preview) {
                    recomended_product.details.preview["description_tagged"] = helpers.clearHomitTags(recomended_product.details.preview.description);
                }
                $scope.recommended_products[i] = recomended_product;
            }
        }, function errorCallback(response) {
            notification.addErrorMessage("Ups.. Error loading page");
        });

    }


    $window.onload = function () {
        $http({
            method: 'POST',
            url: "/api/hub/search",
            data: {
                "search": $scope.searchText
            }
        }).then(function successCallback(response) {
            if (response.data.success) {
                $scope.result_stores = response.data.result.store_type;
                $scope.result_products = response.data.result.products;
                for (let key in $scope.result_products) {
                    for (let i = 0; i < $scope.result_products[key].length; i++) {
                        let product = $scope.result_products[key][i]._source;

                        product["_id"] = $scope.result_products[key][i]["_id"];
                        product["product_url"] = helpers.buildProductPagePath(product, "linas-italian-market");
                        if (product.details.preview) {
                            product.details.preview["description_tagged"] = helpers.clearHomitTags(product.details.preview.description);
                        }
                        $scope.result_products[key][i]._source = product;
                    }
                    $scope.result_length = $scope.result_length + $scope.result_products[key].length;
                }
                $scope.result_length = $scope.result_length + $scope.result_stores.length;
            } else {
                notification.addErrorMessage("Ups.. Error getting search query");
            }
        }, function errorCallback(response) {
            notification.addErrorMessage("Ups.. Error getting search query");
        });
    };

    $scope.init();

});

