app.controller("catalogController", function ($location, $scope, $cookies, $window, $http, $rootScope, $timeout, $mdSidenav, $log, sessionStorage, notification, googleAnalytics) {
    var catalogCtrl = this;

    $scope.selection = $location.path();
    $scope.showCategories = false;
    $scope.isBeers = false;
    $scope.isWines = false;
    $scope.isSpirits = false;
    $scope.isOthers = false;

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

    $scope.hrefToStore = function (path) {
        $window.location.href = $window.location.origin + path;
    };

    $scope.hrefToCat = function (category) {
        $window.location.href = $window.location.origin + hrefChangeCategory($window.location.pathname, _.trim(_.lowerCase(category)).replace(/ /g, "-"));
    };

    $scope.hrefPrdPage = function (product) {
        var path;
        path = "/catalog/product/" + product.store_type_api_name + "/" + _.trim(_.toLower(_.trim(product.brand) + " " + _.trim(product.name))).replace(/ /g, "-") + "/" + product.product_id;
        
        googleAnalytics.addEvent('product_clicked', {
            "event_label": product.brand + " " + product.name,
            "event_category": googleAnalytics.eventCategories.catalog_actions
        });

        $window.location.href = $window.location.origin + _.toLower(clearProductUrl(path));
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


    $scope.filterCategories = function () {
        $('#category_box').animate({ width: 'toggle' });
        if ($scope.showCategories) {
            $scope.showCategories = false;
            document.getElementById("show_cat_icon").classList.add('rot-cat-btn_2');
            var el = document.getElementById("show_cat_icon").classList;
            setTimeout(function () {
                el.remove('rot-cat-btn_1', 'rot-cat-btn_2');
            }, 500);
        } else {
            $scope.showCategories = true;
            document.getElementById("show_cat_icon").classList.add('rot-cat-btn_1');
        }
    };

    // USer Cart right-SideNav functionality
    // Start
    $scope.toggleNavLeft = buildToggler('nav-btn-mob');
    $scope.NavigateOpen = function () {
        return $mdSidenav('nav-btn-mob').isOpen();
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
        $mdSidenav('nav-btn-mob').close()
            .then(function () {
                $log.debug("close NAVIGATE is done");
            });
    };
    // End

    function clickRadioButton(id) {
        $("#" + id).click();
        $scope.$apply();
    }

    $window.onload = function () {
        $scope.screenIsMob = global_screenIsMob;
        var isCategoryClicked = sessionStorage.getCategoryClicked();
        var subcad = sessionStorage.getSearchSubcategory();
        var prodID = sessionStorage.getSearchProduct();
        setTimeout(function () {
            if (subcad != 'undefined' && subcad != null) {
                var x = document.querySelectorAll(".cat-body-cat");
                for (var i = 0; i < x.length; i++) {
                    if (x[i].textContent.trim() == subcad) {
                        clickRadioButton(x[i].id);
                        $scope.filterCategories();
                        break;
                    }
                }
            } else if (isCategoryClicked == "true") {
                $scope.filterCategories();
                clickRadioButton("radio_0");
            } else if (isCategoryClicked == "store-switched") {
                sessionStorage.setCategoryClicked(true);
                clickRadioButton("radio_0");
            } else {
                sessionStorage.setCategoryClicked(true);
                clickRadioButton("radio_0");
            }
            if (prodID != 'undefined') {
                var y = document.querySelectorAll(".item-box");
                for (var j = 0; j < y.length; j++) {
                    if (y[j].id == prodID) {
                        var top = $("#" + y[j].id).offset().top - ($window.innerHeight / 5);
                        animateScrollTo(top, 1600);
                        $("#" + prodID).addClass("highlighted");
                        if (subcad == 'undefined' && subcad == null) {
                            $scope.filterCategories();
                        }
                        break;
                    }
                }
                setTimeout(function () {
                    $("#" + prodID).removeClass("highlighted");
                }, 2500);
            }
        }, 20);
        $('#loading').fadeOut();
    };


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

    function clearProductUrl(path){
        var tempPath = path;
        let characters = ["#", "&", "'", ",", ".", "%"];
        for(let i=0; i<characters.length; i++){
            tempPath = tempPath.replace(characters[i], "");
        }
        return tempPath;
    }

    $scope.scroll_prev = 0;
    $scope.scroll_current = 0;

    $(window).on('scroll', function () {
        var scrollTop = $(window).scrollTop();
        var elementOffset = $("#items-section").offset().top;
        $scope.scroll_prev = $scope.scroll_current;
        $scope.scroll_current = elementOffset - scrollTop;

        if ($scope.scroll_prev > $scope.scroll_current && $scope.scroll_current <= 54) {
            $("#category-box").removeClass("cat-section-absolute");
            $("#category-box").addClass("cat-section-fixed");
        } else if ($scope.scroll_prev < $scope.scroll_current && $scope.scroll_current >= 54) {
            $("#category-box").removeClass("cat-section-fixed");
            $("#category-box").addClass("cat-section-absolute");
        }
    });


});

