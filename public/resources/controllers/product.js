app.controller("productController", function ($scope, $rootScope, $window, sessionStorage) {
    $scope.init = function () {
        $scope.recommended_products = JSON.parse($("#recommendedProducts").val());
        $scope.product = JSON.parse($("#product").val());
        let container = sessionStorage.getProductContainerSelected();
        if (container != null && (container.id == $scope.product.brand + " " + $scope.product.name)) {
            $scope.selected_container = sessionStorage.getProductContainerSelected().container;
        } else {
            $scope.selected_container = $("#default_container").val();
            rememberProduct($scope.selected_container);
        }

        $scope.container_info = $scope.product.products[$scope.selected_container];
    }

    $scope.addToCart = function (product) {
        if (product.store_open) {
            // var p = jQuery.extend(true, {}, product);
            var p = {};

            p.super_category = product.super_category;
            p.volume = product.products[$scope.selected_container].product_variants.all_volumes[product.products[$scope.selected_container].selectedVolume];
            p.packaging = product.products[$scope.selected_container].product_variants[product.products[$scope.selected_container].product_variants.all_volumes[product.products[$scope.selected_container].selectedVolume]].all_packagings[product.products[$scope.selected_container].selectedPack];
            p.price = product.products[$scope.selected_container].product_variants[product.products[$scope.selected_container].product_variants.all_volumes[product.products[$scope.selected_container].selectedVolume]][product.products[$scope.selected_container].product_variants[product.products[$scope.selected_container].product_variants.all_volumes[product.products[$scope.selected_container].selectedVolume]].all_packagings[product.products[$scope.selected_container].selectedPack]].price;
            p.depot_id = product.products[$scope.selected_container].product_variants[product.products[$scope.selected_container].product_variants.all_volumes[product.products[$scope.selected_container].selectedVolume]][product.products[$scope.selected_container].product_variants[product.products[$scope.selected_container].product_variants.all_volumes[product.products[$scope.selected_container].selectedVolume]].all_packagings[product.products[$scope.selected_container].selectedPack]].depot_id;
            p.image = product.products[$scope.selected_container].image;
            p.brand = product.brand;

            $rootScope.$broadcast("addToCart", p);
        }
    };

    $scope.volumeLeft = function (product) {
        let i = product.selectedPack;
        let selected_container = $scope.selected_container;
        i = i - 1;
        if (i < 0) {
            $scope.product.products[selected_container].selectedVolume = i + 1;
        } else {
            $scope.product.products[selected_container].selectedVolume = i;
        }
    }

    $scope.volumeRight = function (product) {
        let i = product.selectedPack;
        let selected_container = $scope.selected_container;
        i = i + 1;
        if (i >= product.product_variants.all_volumes.length) {
            $scope.product.products[selected_container].selectedVolume = i - 1;
        } else {
            $scope.product.products[selected_container].selectedVolume = i
        }
    }

    $scope.packRight = function (product) {
        let i = product.selectedPack;
        let volume = product.product_variants.all_volumes[product.selectedVolume];
        let selected_container = $scope.selected_container;
        i = i + 1;
        if (i >= product.product_variants[volume].all_packagings.length) {
            $scope.product.products[selected_container].selectedPack = i - 1;
        } else {
            $scope.product.products[selected_container].selectedPack = i
        }
    }

    $scope.packLeft = function (product) {
        let i = product.selectedPack;
        let volume = product.product_variants.all_volumes[product.selectedVolume];
        let selected_container = $scope.selected_container;
        i = i - 1;
        if (i < 0) {
            $scope.product.products[selected_container].selectedPack = i + 1;
        } else {
            $scope.product.products[selected_container].selectedPack = i;
        }
    }

    $scope.hrefTo = function (path) {
        $window.location.href = $window.location.origin + path;
    }

    $scope.updateContainer = function (container) {
        rememberProduct(container);
        $scope.selected_container = container;
        $scope.container_info = $scope.product.products[$scope.selected_container]
    }

    function rememberProduct(container) {
        var p = {
            id: $scope.product.brand + " " + $scope.product.name,
            container: container
        }
        sessionStorage.setProductContainerSelected(p);
    }

    $scope.init();
});

