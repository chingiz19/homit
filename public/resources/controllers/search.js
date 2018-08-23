app.controller("searchController", function ($location, $scope, $cookies, $window, $http, $rootScope, $timeout, $log, sessionStorage, notification, googleAnalytics, localStorage, helpers) {

    $scope.init = function () {
        $scope.search_result = {};
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
                let data = response.data.result.products;
                let tmp_data = new Map();

                let search_text = "<em>" + $scope.searchText + "</em>";
                for (let i = 0; i < data.length; i++) {
                    let tmp_list = [];

                    for (let j = 0; j < data[i].results.length; j++) {
                        let tmp_product = data[i].results[j]._source;
                        tmp_product["_id"] = data[i].results[j]._id;
                        tmp_product["image"] = "/resources/images/products/" + tmp_product.store.name + tmp_product.images.image_catalog;
                        tmp_product["url"] = helpers.buildProductPagePath(tmp_product);
                        tmp_list.push(tmp_product);
                        $scope.result_length = $scope.result_length + 1;
                    }

                    tmp_data.set(data[i].highlight || search_text, tmp_list);

                }
                $scope.search_result.products = tmp_data;

            } else {
                notification.addErrorMessage("Ups.. Error getting search query");
            }
        }, function errorCallback(response) {
            notification.addErrorMessage("Ups.. Error getting search query");
        });
    };

    $scope.init();

});

