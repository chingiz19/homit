app.controller("productController", function ($scope, $rootScope, $window, sessionStorage, notification) {
    $scope.init = function () {
        $scope.recommended_products = JSON.parse($("#recommendedProducts").val());
        $scope.product = JSON.parse($("#product").val());
        $scope.productImages = JSON.parse($("#product-images").val()).images;
        if($scope.productImages.length > 0){
            $scope.selectedImage = $scope.productImages[0];
        }
    };

    $scope.addToCart = function (product) {
            var p = {};
            p.store_type_api_name = product.store_type_api_name;
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
                "event_category": googleAnalytics.eventCategories.cart_actions,
                "value": "product_page",
                "items": [
                    {
                        name: product.name,
                        brand: product.brand,
                        quantity: tmpQuantity,
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
        $window.location.href = $window.location.origin + "/catalog/" + path;
        sessionStorage.setCategoryClicked("store-switched");
    };

    $scope.hrefToSubcat = function(product){
        $window.location.href = $window.location.origin + "/catalog/" + product.store_type_api_name + "/" + product.category;
        sessionStorage.setSearchSubcategory(product.subcategory);
    };

    $scope.hrefPrdPage = function (product) {
        var path;
        path = "/catalog/product/" + product.store_type_api_name + "/" + _.toLower(clearProductUrl(_.trim(_.toLower(_.trim(product.brand) + " " + _.trim(product.name))).replace(/ /g, "-"))) + "/" + product.product_id;
        
        $window.location.href = $window.location.origin + path;
    };

    function clearProductUrl(path){
        var tempPath = path;
        tempPath = tempPath.replace(/[#&',.%/()]/g, "");
        tempPath = tempPath.replace(/[---]/g, "-");
        tempPath = tempPath.replace(/[--]/g, "-");
        return tempPath;
    }

    $scope.init();
});

