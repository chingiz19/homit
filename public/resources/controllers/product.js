app.controller("productController", function ($scope, $rootScope, $window, $http, sessionStorage, notification, helpers, googleAnalytics) {
    $scope.init = function () {
        $scope.product = JSON.parse($("#product").val());
        $scope.productImages = JSON.parse($("#product-images").val()).images;
        if($scope.productImages.length > 0){
            $scope.selectedImage = $scope.productImages[0];
        }

        $http({
            method: 'POST',
            url: "/api/hub/randomproducts",
            data:{
                limit: 5
            }
        }).then(function successCallback(response) {
            $scope.recommended_products = buildProductUrl(response.data.result);
        }, function errorCallback(response) {
            notification.addErrorMessage("Ups.. Error loading page");
        });

    };

    function buildProductUrl(products){
        let tmpList = products;
        for(let x=0; x<tmpList.length; x++){
            tmpList[x]["product_url"] = helpers.buildProductPagePath(tmpList[x], tmpList[x].store_type_name);
        }
        return tmpList;
    }

    $scope.addToCart = function (product) {
            var p = {};

            p.brand = product.brand;
            p.name = product.name;
            p.image = product.images.image_catalog;
            p.store_type_name = product.store_type_name;
            if(product.variance[product.selectedVolume].preffered_unit){
                p.volume = product.variance[product.selectedVolume].preffered_unit_size + product.variance[product.selectedVolume].preffered_unit;
            }else{
                p.volume = product.variance[product.selectedVolume].preffered_unit_size ;
            }
            p.packaging = product.variance[product.selectedVolume].packs[product.selectedPack].h_value;
            p.price = product.variance[product.selectedVolume].packs[product.selectedPack].price;
            p.UID = product.variance[product.selectedVolume].packs[product.selectedPack]._id;

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

    /**
     * Switches product volume to right if available
     * @param {object} product 
     */
    $scope.volumeRight = function (product) {
        let i = product.product_variants.selectedVolume;
        i = i + 1;
        if (i >= product.product_variants.all_volumes.length) {
            $scope.product.product_variants.selectedVolume = i - 1;
        } else {
            $scope.product.product_variants.selectedVolume = i;
        }
    };

    /**
     * Switches product volume to left if available
     * @param {object} product 
     */
    $scope.volumeLeft = function (product) {
        let i = product.product_variants.selectedVolume;
        i = i - 1;
        if (i < 0) {
            $scope.product.product_variants.selectedVolume = i + 1;
        } else {
            $scope.product.product_variants.selectedVolume = i;
        }
    };

    /**
     * Switches product packaging to right if available
     * @param {object} product 
     */
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

    /**
     * Switches product packaging to left if available
     * @param {object} product 
     */
    $scope.packLeft = function (product) {
        let i = product.product_variants.selectedPack;
        i = i - 1;
        if (i < 0) {
            $scope.product.product_variants.selectedPack = i + 1;
        } else {
            $scope.product.product_variants.selectedPack = i;
        }
    };

    $scope.hrefToSubcat = function(product){
        googleAnalytics.addEvent('subcat_nav_clicked', {
            "event_label": product.subcategory,
            "event_category": googleAnalytics.eventCategories.product_actions
        });

        sessionStorage.setUserSelectedSubcategory(product.subcategory);
        $window.location.href = $window.location.origin + "/hub/" + product.store_type_name + "/" + helpers.urlReplaceSpaceWithDash(product.category);
    };

    /**
     * * Fires Google Analytics event when store hub in "Product Nav" clicked
     */
    $scope.navHubClicked = function(){
        googleAnalytics.addEvent('store_nav_clicked', {
            "event_label": "Store Hub",
            "event_category": googleAnalytics.eventCategories.product_actions
        });
    };

    /**
     * Fires Google Analytics event when store in "Product Nav" clicked
     * @param {string} store 
     */
    $scope.navStoreClicked = function(store){
        googleAnalytics.addEvent('store_nav_clicked', {
            "event_label": store,
            "event_category": googleAnalytics.eventCategories.product_actions
        });
    };

    /**
     * Fires Google Analytics event when category in "Product Nav" clicked
     * @param {string} category 
     */
    $scope.navCatClicked = function(category){
        googleAnalytics.addEvent('cat_nav_clicked', {
            "event_label": category,
            "event_category": googleAnalytics.eventCategories.product_actions
        });
    };

    /**
     * Fires Google Analytics event when product in "People also Homit" section clicked
     * @param {object} product 
     */
    $scope.peopleHomitPrdClicked = function (product) {
        googleAnalytics.addEvent('product_clicked', {
            "event_label": product.brand + " " + product.name + "; People also Homit",
            "event_category": googleAnalytics.eventCategories.product_actions
        });
    };

    $window.onload = function () {
        $('#loading').fadeOut();
    };

    $scope.init();
});

