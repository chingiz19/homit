app.controller("productController", function ($scope, $rootScope, $window, sessionStorage, notification, helpers, googleAnalytics) {
    $scope.init = function () {
        $scope.recommended_products = buildProductUrl(JSON.parse($("#recommendedProducts").val()));
        $scope.product = JSON.parse($("#product").val());
        $scope.productImages = JSON.parse($("#product-images").val()).images;
        if($scope.productImages.length > 0){
            $scope.selectedImage = $scope.productImages[0];
        }
    };

    function buildProductUrl(products){
        let tmpList = products;
        for(let x=0; x<tmpList.length; x++){
            tmpList[x]["product_url"] = helpers.buildProductPagePath(tmpList[x]);
        }
        return tmpList;
    }

    $scope.addToCart = function (product) {
            var p = {};
            p.store_type_name = product.store_type_name;
            p.volume = product.product_variants.all_volumes[product.product_variants.selectedVolume];
            p.packaging = product.product_variants[product.product_variants.all_volumes[product.product_variants.selectedVolume]].all_packagings[product.product_variants.selectedPack];
            p.price = product.product_variants[product.product_variants.all_volumes[product.product_variants.selectedVolume]][product.product_variants[product.product_variants.all_volumes[product.product_variants.selectedVolume]].all_packagings[product.product_variants.selectedPack]].price;
            p.depot_id = product.product_variants[product.product_variants.all_volumes[product.product_variants.selectedVolume]][product.product_variants[product.product_variants.all_volumes[product.product_variants.selectedVolume]].all_packagings[product.product_variants.selectedPack]].depot_id;
            if (!$scope.productImages[0].includes("nutritions")) {
                p.image = $scope.productImages[0];
            } else {
                p.image = $scope.productImages[1];
            }
            p.brand = product.brand;
            p.name = product.name;

            $rootScope.$broadcast("addToCart", p);
            googleAnalytics.addEvent('add_to_cart', {
                "event_label": product.brand + " " + product.name,
                "event_category": googleAnalytics.eventCategories.product_actions,
                "value": "product_page",
                "items": [
                    {
                        name: product.name,
                        brand: product.brand,
                        price: product.price,
                        category: product.packaging,
                        variant: product.volume,
                    }
                ]
            });
    };

    $scope.selectImage = function (image) {
        $scope.selectedImage = image;
    };

    $scope.volumeLeft = function (product) {
        let i = product.product_variants.selectedVolume;
        i = i - 1;
        if (i < 0) {
            $scope.product.product_variants.selectedVolume = i + 1;
        } else {
            $scope.product.product_variants.selectedVolume = i;
        }
    };

    $scope.volumeRight = function (product) {
        let i = product.product_variants.selectedVolume;
        i = i + 1;
        if (i >= product.product_variants.all_volumes.length) {
            $scope.product.product_variants.selectedVolume = i - 1;
        } else {
            $scope.product.product_variants.selectedVolume = i;
        }
    };

    $scope.packRight = function (product) {
        let i = product.product_variants.selectedPack;
        let volume = product.product_variants.all_volumes[product.product_variants.selectedVolume];
        i = i + 1;
        if (i >= product.product_variants[volume].all_packagings.length) {
            $scope.product.product_variants.selectedPack = i - 1;
        } else {
            $scope.product.product_variants.selectedPack = i;
        }
    };

    $scope.packLeft = function (product) {
        let i = product.product_variants.selectedPack;
        i = i - 1;
        if (i < 0) {
            $scope.product.product_variants.selectedPack = i + 1;
        } else {
            $scope.product.product_variants.selectedPack = i;
        }
    };

    $scope.hrefTo = function (path) {
        $window.location.href = $window.location.origin + path;
    };

    $scope.hrefToStore = function(path){
        googleAnalytics.addEvent('store_nav_clicked', {
            "event_label": path,
            "event_category": googleAnalytics.eventCategories.product_actions
        });

        $window.location.href = $window.location.origin + "/hub/" + path;
    };

    $scope.hrefToCat = function(product){
        let path = product.store_type_name + "/" + product.category;
        googleAnalytics.addEvent('cat_nav_clicked', {
            "event_label": path,
            "event_category": googleAnalytics.eventCategories.product_actions
        });

        $window.location.href = $window.location.origin + "/hub/" + path;
    }

    $scope.hrefToSubcat = function(product){
        googleAnalytics.addEvent('subcat_nav_clicked', {
            "event_label": product.subcategory,
            "event_category": googleAnalytics.eventCategories.product_actions
        });

        sessionStorage.setUserSelectedSubcategory(product.subcategory);
        $window.location.href = $window.location.origin + "/hub/" + product.store_type_name + "/" + helpers.urlReplaceSpaceWithDash(product.category);
    };

    $scope.hrefPrdPage = function (product) {
        googleAnalytics.addEvent('product_clicked', {
            "event_label": product.brand + " " + product.name + "; People also Homit",
            "event_category": googleAnalytics.eventCategories.product_actions
        });
        $window.location.href = $window.location.origin + helpers.buildProductPagePath(product);
    };

    $window.onload = function () {
        $('#loading').fadeOut();
    };

    $scope.init();
});

