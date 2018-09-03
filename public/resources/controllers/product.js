app.controller("productController", function ($scope, $rootScope, $window, $http, sessionStorage, notification, helpers, googleAnalytics) {
    $scope.init = function () {
        $scope.product = JSON.parse($("#product").val());
        $scope.productImages = JSON.parse($("#product-images").val()).images;
        if($scope.productImages.length > 0){
            $scope.selectedImage = $scope.productImages[0];
        }

        $http({
            method: 'POST',
            url: "/api/hub/similarproducts",
            data:{
                limit: 8,
                product_id: $scope.product._id
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
            tmpList[x]["product_url"] = helpers.buildProductPagePath(tmpList[x]);
        }
        return tmpList;
    }

    $scope.addToCart = function (product) {
            var p = product;

            p["selected"] = {
                "UID": p.UID = product.variance[product.selectedVolume].packs[product.selectedPack]._id,
                "quantity": 1,
                "price": p.price = product.variance[product.selectedVolume].packs[product.selectedPack].price,
                "pack": product.variance[product.selectedVolume].packs[product.selectedPack].h_value 
            };

            if(product.variance[product.selectedVolume].preffered_unit){
                p.selected.size = product.variance[product.selectedVolume].preffered_unit_size + product.variance[product.selectedVolume].preffered_unit;
            }else{
                p.selected.size = product.variance[product.selectedVolume].preffered_unit_size ;
            }

            $rootScope.$broadcast("addToCart", p);
            googleAnalytics.addEvent('add_to_cart', {
                "event_label": p.brand + " " + p.name,
                "event_category": googleAnalytics.eventCategories.product_actions,
                "value": "product_page",
                "items": [
                    {
                        name: p.name,
                        brand: p.brand,
                        price: p.selected.price,
                        category: p.selected.pack,
                        variant: p.selected.size,
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
        let i = product.selectedVolume;
        i = i + 1;
        if (i >= product.variance.length) {
            $scope.product.selectedVolume = i - 1;
        } else {
            $scope.product.selectedVolume = i;
        }
    };

    /**
     * Switches product volume to left if available
     * @param {object} product 
     */
    $scope.volumeLeft = function (product) {
        let i = product.selectedVolume;
        i = i - 1;
        if (i < 0) {
            $scope.product.selectedVolume = i + 1;
        } else {
            $scope.product.selectedVolume = i;
        }
    };

    /**
     * Switches product packaging to right if available
     * @param {object} product 
     */
    $scope.packRight = function (product) {
        let selected_pack = product.selectedPack;
        let selected_volume = product.selectedVolume;
        selected_pack = selected_pack + 1;
        if ( selected_pack >= product.variance[selected_volume].packs.length) {
            $scope.product.selectedPack = selected_pack - 1;
        } else {
            $scope.product.selectedPack = selected_pack;
        }
    };

    /**
     * Switches product packaging to left if available
     * @param {object} product 
     */
    $scope.packLeft = function (product) {
        let selected_pack = product.selectedPack;
        selected_pack = selected_pack - 1;
        if (selected_pack < 0) {
            $scope.product.selectedPack = selected_pack + 1;
        } else {
            $scope.product.selectedPack = selected_pack;
        }
    };

    /**
     * Navigates to catalog with selected subcategory
     * @param {object} product 
     */
    $scope.hrefToSubcat = function(product){
        googleAnalytics.addEvent('subcat_nav_clicked', {
            "event_label": product.subcategory,
            "event_category": googleAnalytics.eventCategories.product_actions
        });

        sessionStorage.setUserSelectedSubcategory(product.subcategory);
        $window.location.href = $window.location.origin + "/hub/" + product.store_type_name + "/" + product.category.category_name;
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

