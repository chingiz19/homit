app.controller("searchController", function ($location, $scope, $cookies, $window, $http, $rootScope, $timeout, $log, sessionStorage, notification, googleAnalytics, localStorage, helpers) {

    $scope.init = function () {
        $scope.recommended_products = [];
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
                let untagged_description = untagDescription(recomended_product);
                recomended_product["url"] = helpers.buildProductPagePath(recomended_product, recomended_product.store_type_name);
                if(untagged_description){
                    recomended_product.details["untagged_description"] = untagged_description;
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
                let tmp_data = {};

                for (let i = 0; i < data.length; i++) {
                    let tmp_list = [];

                    for (let j = 0; j < data[i].results.length; j++) {
                        let tmp_product = data[i].results[j]._source;
                        let untagged_description = untagDescription(tmp_product);
                        tmp_product["_id"] = data[i].results[j]._id;
                        tmp_product.images["catalog_image_url"] = "/resources/images/products/" + tmp_product.store.name + "/" + tmp_product.images.image_catalog;
                        tmp_product["url"] = helpers.buildProductPagePath(tmp_product);
                        if(untagged_description){
                            tmp_product.details["untagged_description"] = untagged_description;
                        }
                        tmp_list.push(tmp_product);
                        $scope.result_length = $scope.result_length + 1;
                    }

                    if(data[i].highlight){
                        tmp_data[data[i].highlight] = tmp_list;
                    } else{
                        tmp_data[$scope.searchText] = tmp_list;
                    }
                    
                }
                $scope.search_result.products = tmp_data;

            } else {
                notification.addErrorMessage("Ups.. Error getting search query");
            }
        }, function errorCallback(response) {
            notification.addErrorMessage("Ups.. Error getting search query");
        });
    };

    /**
     * Used to removed html tags
     * @param {object} product 
     */
    function untagDescription(product){
        let tmp_text;
        if(product.details.preview && product.details.preview.hasOwnProperty("description")){
            tmp_text = helpers.clearHomitTags(product.details.preview.description);
        } else if(product.details.serving_suggestions && product.details.serving_suggestions.hasOwnProperty("description")){
            tmp_text = helpers.clearHomitTags(product.details.preview.description);
        }
        if (tmp_text) return tmp_text;
    }

    $scope.init();

});

