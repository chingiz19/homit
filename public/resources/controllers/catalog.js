app.controller("catalogController", function ($location, $scope, $cookies, $window, $http, $rootScope, $timeout, $mdSidenav, $log, sessionStorage, notification, googleAnalytics) {
    var catalogCtrl = this;

    $scope.selection = $location.path();

    $scope.isBeers = false;
    $scope.isWines = false;
    $scope.isSpirits = false;
    $scope.isOthers = false;
    $scope.screenIsMob = false;


    $scope.selectedCategory = undefined;

    $scope.productUrl = '/api' + $scope.selection;
    $scope.searchedBrand = "";

    // Get initial list of products
    $scope.products = undefined;
    $scope.subcategories = [];
    $scope.availableTypes = [];
    $scope.availableBrands = [];
    $scope.allBrands = [];
    $http({
        method: 'GET',
        url: $scope.productUrl
    }).then(function successCallback(response) {
        if (response.data.success) {
            $scope.products = response.data.products;
            $scope.products.forEach(function (product) {
                product.selectedVolume = product.product_variants.all_volumes[0];
                product.selectedPack = product.product_variants[product.selectedVolume].all_packagings[0];
                product.volumeI = 0;
                product.packJ = 0;
            });
            $scope.subcategories = response.data.subcategories;
            $scope.userSelectedSubcategories = $scope.subcategories[0].subcategory_name;
        }
    }, function errorCallback(response) {

    });

    function getElementIdByName(subcategory) {
        var result = -1;
        for (i = 0; i < $scope.subcategories.length; i++) {
            if ($scope.subcategories[i].subcategory_name == subcategory) {
                result = i;
                break;
            }
        }
        return result;
    }

    $scope.checkSubcategories = function (subcategory) {
        if (subcategory == $scope.userSelectedSubcategories) {
            return;
        }
        $scope.userSelectedSubcategories = subcategory;
        var i = getElementIdByName(subcategory);
        if (i < 0) {
            $scope.availableBrands = $scope.subcategories[0].brands;
        } else {
            $scope.availableBrands = $scope.subcategories[i].brands;
        }
        $scope.userSelectedBrands = [];

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
        if (product.store_open) {
            var p = jQuery.extend(true, {}, product);

            p.volume = p.selectedVolume;
            p.packaging = p.selectedPack;
            p.price = p.product_variants[p.volume][p.packaging].price;
            p.depot_id = p.product_variants[p.volume][p.packaging].depot_id;

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
            // notification.addCartItem(p);
        }
    };

    $scope.nextVolume = function (product) {
        $scope.numberOfVolumes = product.product_variants.all_volumes.length;
        $scope.volumeI = product.volumeI;
        if (product.volumeI < $scope.numberOfVolumes - 1) {
            $scope.volumeI = $scope.volumeI + 1;
        }
        product.volumeI = $scope.volumeI;
        product.selectedVolume = product.product_variants.all_volumes[product.volumeI];
        product.packJ = 0;
        product.selectedPack = product.product_variants[product.selectedVolume].all_packagings[0];
        
        googleAnalytics.addEvent('next_volume', {
            "event_label": product.brand + " " + product.name,
            "event_category": googleAnalytics.eventCategories.catalog_actions
        });
    };

    $scope.previousVolume = function (product) {
        $scope.volumeI = product.volumeI;
        if ($scope.volumeI > 0) {
            $scope.volumeI = $scope.volumeI - 1;
        }
        product.volumeI = $scope.volumeI;
        product.selectedVolume = product.product_variants.all_volumes[product.volumeI];
        product.packJ = 0;
        product.selectedPack = product.product_variants[product.selectedVolume].all_packagings[0];

        googleAnalytics.addEvent('prev_volume', {
            "event_label": product.brand + " " + product.name,
            "event_category": googleAnalytics.eventCategories.catalog_actions
        });
    };

    $scope.nextPack = function (product) {
        $scope.numberOfPacks = product.product_variants[product.product_variants.all_volumes[product.volumeI]].all_packagings.length;
        $scope.packJ = product.packJ;
        if (product.packJ < $scope.numberOfPacks - 1) {
            $scope.packJ = $scope.packJ + 1;
        }
        product.packJ = $scope.packJ;
        product.selectedPack = product.product_variants[product.selectedVolume].all_packagings[product.packJ];
    };

    $scope.previousPack = function (product) {
        $scope.packJ = product.packJ;
        if ($scope.packJ > 0) {
            $scope.packJ = $scope.packJ - 1;
        }
        product.packJ = $scope.packJ;
        product.selectedPack = product.product_variants[product.selectedVolume].all_packagings[product.packJ];
    };

    catalogCtrl.scope = $scope;

    // TODO switch to Subcategories box when Category selected
    $scope.showCategories = false;

        // TODO switch to Subcategories box when Category selected
        $scope.showCategories = false;
        $scope.filterCategories = function () {
            $('#category_box').animate({width: 'toggle'});
            if ($scope.showCategories) {
                $scope.showCategories = false;
                document.getElementById("show_cat_icon").classList.add('rot180_2');
                var el = document.getElementById("show_cat_icon").classList;
                setTimeout(function () {
                    el.remove('rot180_1', 'rot180_2');
                }, 500);
            } else {
                $scope.showCategories = true;
                document.getElementById("show_cat_icon").classList.add('rot180_1');
            }
        };
    $scope.filterCategoriesViaButton = function(){
        $scope.filterCategories();
        googleAnalytics.addEvent('filter_categories', {
            "event_category": googleAnalytics.eventCategories.catalog_actions
        });
    };

    $scope.emptySubcategories = function () {
        $scope.userSelectedSubcategories = null;
    };

    // USer Cart right-SideNav functionality
    // Start
    $scope.toggleNavLeft = buildToggler('navigateMobSN');
    $scope.NavigateOpen = function () {
        return $mdSidenav('navigateMobSN').isOpen();
    };
    function debounce(func, wait, context) {
        var timer;
        return function debounced() {
            var context = $scope,
                args = Array.prototype.slice.call(arguments);
            $timeout.cancel(timer);
            timer = $timeout(function () {
                timer = undefined;
                func.apply(context, args);
            }, wait || 10);
        };
    }
    function buildToggler(navID) {
        return function () {
            $mdSidenav(navID)
                .toggle()
                .then(function () {
                    $log.debug("toggle " + navID + " is done");
                });
        };
    }
    $scope.close = function () {
        $mdSidenav('navigateMobSN').close()
            .then(function () {
                $log.debug("close NAVIGATE is done");
            });
    };
    // End

    function rippleCatButton() {
        var el = document.getElementById("category-button");
        if (el.classList.contains("add-ripplle-affect")) {
            el.classList.remove("add-ripplle-affect");
        }
        setTimeout(function () {
            el.classList.add("add-ripplle-affect");
        }, 1000);
    }

    $window.onload = function () {
        var screen_width = window.screen.width;
        var isCategoryClicked = sessionStorage.getCategoryClicked();
        if (screen_width < 500) {
            $scope.screenIsMob = true;
        } else {
            $scope.screenIsMob = false;
        }
        var subcad = sessionStorage.getSearchSubcategory();
        var prodID = sessionStorage.getSearchProduct();
        setTimeout(function () {
            if (subcad != 'undefined' && subcad != null) {
                var x = document.querySelectorAll(".SubcategoryName");
                for (var i = 0; i < x.length; i++) {
                    if (x[i].textContent.trim() == subcad) {
                        document.getElementById(x[i].id).click();
                        $scope.filterCategories();
                    }
                }
            } else if (isCategoryClicked == "true") {
                $scope.filterCategories();
                document.getElementById('radio_1').click();
            } else if (isCategoryClicked == "store-switched") {
                sessionStorage.setCategoryClicked(true);
                document.getElementById('radio_1').click();
            } else {
                sessionStorage.setCategoryClicked(true);
                document.getElementById('radio_1').click();
            }
            if (prodID != 'undefined') {
                var y = document.querySelectorAll(".itemBoxL1");
                for (var j = 0; j < y.length; j++) {
                    if (y[j].id == prodID) {
                        Element.prototype.documentOffsetTop = function () {
                            return this.offsetTop + (this.offsetParent ? this.offsetParent.documentOffsetTop() : 0);
                        };
                        var top = document.getElementById(y[j].id).documentOffsetTop() - ($window.innerHeight / 5);
                        animateScrollTo(top, 1600);
                        document.getElementById(prodID).classList.add('highlighted');
                        setTimeout(function () {
                            document.getElementById(prodID).classList.remove('highlighted');
                        }, 2500);
                        if (subcad == 'undefined' && subcad == null)
                            $scope.filterCategories();
                    }
                }
            }
        }, 20);
        $('#loading').fadeOut();
    };
    setInterval(rippleCatButton, 3000);
});

