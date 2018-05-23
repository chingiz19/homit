app.controller("catalogController", function ($location, $scope, $cookies, $window, $http, $rootScope, $timeout, $mdSidenav, $log, sessionStorage, notification, googleAnalytics, localStorage) {
    var catalogCtrl = this;

    $scope.scroll_prev = 0;
    $scope.scroll_current = 0;
    $scope.selection = $location.path();
    $scope.showCategories = false;
    $scope.deliveryTime = "";
    $scope.selectedCategory = undefined;
    $scope.header_aisle_wc = "hdr-hilight-cs";
    $scope.header_cat_wc ="";
    $scope.aisle_line_wc = "header-line-grow";
    $scope.cat_line_wc = "";
    $scope.showMobHub = false;
    $scope.mob_hub_icon_c = "";
    $scope.mob_hub_grow_c = "";
    $scope.cat_content_mob_c = "";

    $scope.productUrl = '/api' + $scope.selection;
    try{
        $scope.storeType = $scope.selection.split("/")[2];
    } catch (e){
        // oops
    }

    // Get initial list of products
    $scope.products = undefined;
    $scope.subcategories = [];
    $scope.storeinfo = {};
    $http({
        method: 'GET',
        url: $scope.productUrl
    }).then(function successCallback(response) {
        if (response.data.success) {
            $scope.products = response.data.products;
            $scope.subcategories = response.data.subcategories;
            $scope.userSelectedSubcategories = $scope.subcategories[0].subcategory_name;
            $scope.display_storeInfo = response.data.store_info;
            $(".catalog-store-cover").css("background-image", "url('/resources/images/non-catalog-image/cover-image/" + $scope.display_storeInfo.image.split(".")[0] + ".jpeg");
        }
    }, function errorCallback(response) {

    });

    $scope.checkSubcategories = function (subcategory) {
        if (subcategory == $scope.userSelectedSubcategories) {
            return;
        }
        $scope.userSelectedSubcategories = subcategory;

        googleAnalytics.addEvent('subcategory_selected', {
            "event_label": subcategory,
            "event_category": googleAnalytics.eventCategories.catalog_actions
        });
    };

    $scope.isInSelectedSubcategories = function (subcategory) {
        if ($scope.userSelectedSubcategories == null) {
            return true;
        } else if ($scope.userSelectedSubcategories === subcategory) {
            return true;
        } else {
            return false;
        }
    };

    $scope.addToCart = function (product) {
        if (product.store_open || $scope.deliveryOption == "Scheduled Delivery") {
            var p = jQuery.extend(true, {}, product);

            p.volume = p.product_variants.all_volumes[0];
            p.packaging = p.product_variants[p.product_variants.all_volumes[0]].all_packagings[0];
            p.price = p.product_variants[p.product_variants.all_volumes[0]][p.product_variants[p.product_variants.all_volumes[0]].all_packagings[0]].price;
            p.depot_id = p.product_variants[p.product_variants.all_volumes[0]][p.product_variants[p.product_variants.all_volumes[0]].all_packagings[0]].depot_id;

            //TODO: reverse implementation: assign what is required
            delete p.description;
            delete p.listing_id;
            delete p.product_id;
            delete p.product_variants;
            delete p.subcategory;
            delete p.type;
            delete p.selectedVolume;
            delete p.selectedPack;
            delete p.category;
            delete p.container;

            $rootScope.$broadcast("addToCart", p);
        } else {
            notification.addImportantMessage("Store closed at the moment.");
        }
    };

    $scope.hrefToStore = function (path) {
        $window.location.href = $window.location.origin + path;
    };

    $scope.hrefToCat = function (category) {
        $window.location.href = $window.location.origin + hrefChangeCategory($window.location.pathname, _.trim(_.lowerCase(category)).replace(/ /g, "-"));
    };

    $scope.hrefPrdPage = function (product) {
        var path;
        path = "/catalog/product/" + product.store_type_api_name + "/" + _.toLower(clearProductUrl(_.trim(_.toLower(_.trim(product.brand) + " " + _.trim(product.name))).replace(/ /g, "-"))) + "/" + product.product_id;

        googleAnalytics.addEvent('product_clicked', {
            "event_label": product.brand + " " + product.name,
            "event_category": googleAnalytics.eventCategories.catalog_actions
        });

        $window.location.href = $window.location.origin + path;
    };

    catalogCtrl.scope = $scope;

    $scope.showHideCategory = function () {
        $('#category_box').animate({ width: 'toggle' });
        if($scope.header_aisle_wc){
            $scope.header_aisle_wc = "";
            $scope.header_cat_wc = "hdr-hilight-cs";
            $scope.aisle_line_wc = "";
            $scope.cat_line_wc = "header-line-grow";
        } else{
            $scope.header_aisle_wc = "hdr-hilight-cs";
            $scope.header_cat_wc = "";
            $scope.aisle_line_wc = "header-line-grow";
            $scope.cat_line_wc = "";
        }
    };

    function clickRadioButton(id) {
        $("#" + id).click();
        $scope.$apply();
    }

    function hrefChangeCategory(pathname, category) {
        let pathname_1 = pathname.split("/");
        let pathname_final = "";
        pathname_1[pathname_1.length - 1] = category;
        delete pathname_1[0];
        for (let part in pathname_1) {
            pathname_final = pathname_final + "/" + pathname_1[part];
        }
        return pathname_final;
    }

    function clearProductUrl(path) {
        var tempPath = path;
        let characters = ["#", "&", "'", ",", ".", "%", "/", "(", ")"];
        for (let i = 0; i < characters.length; i++) {
            tempPath = tempPath.replace(characters[i], "");
        }
        tempPath = tempPath.replace("---", "-");
        tempPath = tempPath.replace("--", "-");
        return tempPath;
    }

    $(window).on('scroll', function () {
        var scrollTop = $(window).scrollTop();
        var elementOffset = $("#items-section").offset().top;
        $scope.scroll_prev = $scope.scroll_current;
        $scope.scroll_current = elementOffset - scrollTop;

        if ($scope.scroll_prev > $scope.scroll_current && $scope.scroll_current <= 52) {
            $("#cat-subcat-sec").removeClass("cat-subcat-absolute");
            $("#cat-subcat-sec").addClass("cat-section-fixed");
            $(".checkout-menu-btn-div").removeClass("cart-btn-catalog");
        } else if ($scope.scroll_prev < $scope.scroll_current && $scope.scroll_current >= 52) {
            $("#cat-subcat-sec").removeClass("cat-section-fixed");
            $("#cat-subcat-sec").addClass("cat-subcat-absolute");
            if (!$(".checkout-menu-btn-div").hasClass("cart-btn-catalog")) {
                $(".checkout-menu-btn-div").addClass("cart-btn-catalog");
            }
        }
    });

    $scope.mobHub = function(){
        if(!$scope.showMobHub){
            $scope.mob_hub_icon_c = "icon-rot-1";
            $scope.mob_hub_grow_c = "mobile-hub-section-grow";
            $scope.cat_content_mob_c = "catalog-content-mobile";
        } else{
            $scope.mob_hub_icon_c = "icon-rot-2";
            $scope.mob_hub_grow_c = "";
            $scope.cat_content_mob_c = "";
        }
        $timeout(function () {
            $scope.showMobHub = !$scope.showMobHub;
        }, 150);
    };

    $scope.hubSecSelected = 1;

    $scope.selectHubSec = function(num){
        let num_old = $scope.hubSecSelected;
        $('.p-' + num_old + ' .mh-header-txt').removeClass('mhh-highlight');
        $('.p-' + num_old + ' .mh-header-line').removeClass('header-line-grow');
        $('.p-' + num + ' .mh-header-txt').addClass('mhh-highlight');
        $('.p-' + num + ' .mh-header-line').addClass('header-line-grow');
        $scope.hubSecSelected = num;        
    };

    $window.onload = function () {
        $scope.screenIsMob = global_screenIsMob;
        var isCategoryClicked = sessionStorage.getCategoryClicked();
        var subcad = sessionStorage.getSearchSubcategory();
        setTimeout(function () {
            if (subcad != 'undefined' && subcad != null) {
                var x = document.querySelectorAll(".cat-body-cat");
                for (var i = 0; i < x.length; i++) {
                    if (x[i].textContent.trim() == subcad) {
                        clickRadioButton(x[i].id);
                        $scope.showHideCategory();
                        break;
                    }
                }
            } else if (isCategoryClicked == "true") {
                $scope.showHideCategory();
                clickRadioButton("radio_0");
            } else if (isCategoryClicked == "store-switched") {
                sessionStorage.setCategoryClicked(true);
                clickRadioButton("radio_0");
            } else {
                sessionStorage.setCategoryClicked(true);
                clickRadioButton("radio_0");
            }
        }, 20);
        $('#loading').fadeOut();
    };

});

